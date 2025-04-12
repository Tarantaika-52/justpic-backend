import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { verify } from 'argon2';
import {
  ConfirmAccountDTO,
  LoginDto,
  RegisterUserDTO,
} from 'src/common/dto/users';
import { IClient, IConfirmationCode } from 'src/common/interfaces';
import { AccountRepository } from 'src/common/repositories/accounts.repository';
import { AccountsService } from '../accounts/accounts.service';
import { MailService } from 'src/infra/mail/mail.service';
import { RedisService } from 'src/infra/redis/redis.service';
import {
  mailerRatelimitKey,
  registerPendingKey,
  registrationCodeKey,
} from 'src/common/utils';
import { Role } from 'prisma/__generated__';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  public constructor(
    private readonly repo: AccountRepository,
    private readonly accountService: AccountsService,
    private readonly mailService: MailService,
    private readonly redis: RedisService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  /**
   * Выполнить вход в аккаунт и создать сессию
   * @param dto
   * @param client
   * @returns
   */
  public async login(dto: LoginDto, client: IClient) {
    const { email, password } = dto;
    const { req } = client;

    const unverifiedSession = req.session.unverifiedSession;
    if (unverifiedSession) {
      throw new BadRequestException(
        'You will not be able to use your account until you confirm its registration.',
      );
    }

    const session = req.session.userSession;

    if (session) {
      throw new BadRequestException('Account login has already been completed');
    }

    const user = await this.getUserForLogin(email);

    if (!user) {
      throw new ForbiddenException('Incorrect login or password');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new ForbiddenException('Incorrect login or password');
    }

    const { id, role } = user;
    await this.saveSession(id, client, role);

    return {
      message: 'Successful authorization',
      uid: user.id,
      ip: client.clientIp,
    };
  }

  /**
   * Получить данные пользователя для проверки
   * @param email
   * @returns
   */
  private async getUserForLogin(email: string) {
    try {
      const user = await this.repo.findUnique({
        where: { email },
        select: { id: true, email: true, password: true, role: true },
      });
      return user;
    } catch (err) {
      this.logger.error(
        'Failed to get user for authorization operations',
        err.message,
      );
      throw new InternalServerErrorException(
        'Failed to get user for authorization operations',
      );
    }
  }

  /**
   * Регистрация нового пользователя и отправка письма с кодом
   * для подтверждения почты
   * @param dto
   * @param clientIP
   * @returns
   */
  public async register(dto: RegisterUserDTO, client: IClient) {
    const { req } = client;
    const { email } = dto;

    const session = req.session.userSession;

    if (session) {
      throw new BadRequestException('Account login has already been completed');
    }

    await this.accountService.createRegistrationPending(dto);
    await this.sendConfirmationCode(email, client);
    req.session.unverifiedSession = { email };

    return {
      message:
        'Its almost done. It remains to confirm the account using a code sent to the specified email address.',
    };
  }

  /**
   * Отправить код подтверждения на указанный адрес почты
   * @param email
   */
  private async sendConfirmationCode(email: string, client: IClient) {
    const code = String(Math.floor(Math.random() * 999999));
    const data: IConfirmationCode = { email, code };
    await this.checkConfirmRateLimit(client);
    try {
      await this.saveConfirmationCode(data);
    } catch (err) {
      this.logger.error(
        'Redis error: Failed to save verification code',
        err.message,
      );
      throw new InternalServerErrorException(
        'Failed to save verification code',
      );
    }
    try {
      await this.sendEmailWithConfirmationCode(data);
    } catch (err) {
      this.logger.error(
        'Failed to send email with verification code',
        err.message,
      );
      throw new InternalServerErrorException(
        'Failed to send email with verification code',
      );
    }
  }

  private async checkConfirmRateLimit(client: IClient) {
    const { req } = client;
    const { ip } = req;
    const redisKey = mailerRatelimitKey(ip);

    const attempts = await this.redis.incr(redisKey);
    if (attempts == 1) {
      await this.redis.expire(redisKey, 60 * 15); // 15 минут
    }
    if (attempts > 5) {
      throw new HttpException(
        {
          message:
            'Whoa! It seems that you are requesting too many verification codes.Try again later',
          error: 'Too many requests',
          statusCode: 429,
        },
        429,
      );
    }
  }

  /**
   * Сохранить код подтверждения в redis
   * @param data
   */
  private async saveConfirmationCode(data: IConfirmationCode) {
    const email = data.email;
    const jsonData = JSON.stringify(data);
    const redisKey = registrationCodeKey(email);
    await this.redis.set(redisKey, jsonData, 'EX', 900);
  }

  /**
   * Отправить код подтверждения на адрес электронной почты
   * @param data
   */
  private async sendEmailWithConfirmationCode(data: IConfirmationCode) {
    const { email, code } = data;
    await this.mailService.sendMail({
      to: email,
      subject: 'Подтверждение регистрации аккаунта',
      html: `<p>Ваш код подтверждения: ${code}</p>`,
    });
  }

  /**
   * Подтвердить почту через код из письма
   * @param email
   * @param code
   */
  public async confirmAccount(dto: ConfirmAccountDTO, client: IClient) {
    const { req } = client;
    const { code } = dto;

    const userSession = req.session.userSession;
    if (userSession) {
      throw new BadRequestException('The account has already been verified.');
    }
    const unverifiedSession = req.session.unverifiedSession;
    if (!unverifiedSession) {
      throw new BadRequestException('Unable to verify non-existent account');
    }

    const { email } = unverifiedSession;
    const redisKey = registrationCodeKey(email);
    const savedCodeJSON = await this.redis.get(redisKey);
    if (!savedCodeJSON) {
      await this.sendConfirmationCode(email, client);
      throw new BadRequestException('Verification code has expired');
    }
    const savedCodeObject = JSON.parse(savedCodeJSON);

    const savedCode = savedCodeObject.code;

    const isCorrectCode = code == savedCode;
    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect confirm code');
    }

    await this.redis.del(redisKey);

    const tempUserKey = registerPendingKey(email);
    const tempUser = await this.redis.get(tempUserKey);
    if (!tempUser) {
      throw new ForbiddenException('Account verification period has expired');
    }
    const userDto = JSON.parse(tempUser) as RegisterUserDTO;
    const user = await this.accountService.allowRegistrationPending(userDto);
    await this.redis.del(tempUserKey);

    req.session.unverifiedSession = undefined;
    await this.saveSession(user.id, client);

    return { message: 'Account confirmed' };
  }

  /**
   * Сохранить сессию
   * @param sessionData
   * @param client
   */
  private async saveSession(
    id: string,
    client: IClient,
    role: Role = 'REGULAR',
  ) {
    const { req } = client;
    const sessionData = {
      id,
      role,
      client: { ip: req.ip, ua: req.headers['user-agent'] },
    };
    req.session.userSession = sessionData;
  }

  /**
   * Завершить (удалить) сессию
   * @param client
   */
  private async deleteSession(client: IClient) {
    const { req } = client;
    req.session = undefined;
  }
}
