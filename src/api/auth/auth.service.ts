import {
  BadRequestException,
  ForbiddenException,
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
import { randomBytes } from 'crypto';
import { MailService } from 'src/infra/mail/mail.service';
import { RedisService } from 'src/infra/redis/redis.service';

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

    const user = await this.getUserForLogin(email);

    if (!user) {
      this.throwIncorrectLoginDataException();
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      this.throwIncorrectLoginDataException();
    }

    await this.saveSession({ id: user.id }, client);

    return {
      message: 'Successful authorization',
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
        select: { id: true, email: true, password: true, isConfirmed: true },
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
   * Выбросить ошибку авторизации
   */
  private throwIncorrectLoginDataException(): never {
    throw new ForbiddenException('Incorrect login or password');
  }

  /**
   * Регистрация нового пользователя и отправка письма с кодом
   * для подтверждения почты
   * @param dto
   * @param clientIP
   * @returns
   */
  public async register(dto: RegisterUserDTO, client: IClient) {
    const { clientIp, req } = client;
    await this.accountService.createRegisterPending(dto, clientIp);
    await this.sendConfirmationCode(dto.email);
    req.session.tempSession = { email: dto.email };
  }

  /**
   * Отправить код подтверждения на указанный адрес почты
   * @param email
   */
  private async sendConfirmationCode(email: string) {
    const code = randomBytes(3).toString('hex');
    const data: IConfirmationCode = { email, code };
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

  /**
   * Сохранить код подтверждения в redis
   * @param data
   */
  private async saveConfirmationCode(data: IConfirmationCode) {
    const email = data.email;
    const jsonData = JSON.stringify(data);
    const redisKey = `code:confirm:${email}`;
    await this.redis.set(redisKey, jsonData, 'EX', 1800);
  }

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

    const tempSession = req.session.tempSession;
    const userSession = req.session.userSession;
    if (userSession) {
      throw new BadRequestException('The account has already been verified.');
    }
    if (!tempSession) {
      throw new BadRequestException('Unable to verify non-existent account');
    }

    const { email } = tempSession;
    const redisKey = `code:confirm:${email}`;
    const savedCodeJSON = await this.redis.get(redisKey);
    const savedCodeObject = JSON.parse(savedCodeJSON);
    if (!savedCodeObject) {
      await this.sendConfirmationCode(email);
      throw new BadRequestException('Verification code has expired');
    }

    const savedCode = savedCodeObject.code;

    const isCorrectCode = code == savedCode;
    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect confirm code');
    }

    await this.redis.del(redisKey);

    const tempUserKey = `pending:register:${email}`;
    const tempUser = await this.redis.get(tempUserKey);
    if (!tempUser) {
      throw new ForbiddenException('Account verification period has expired');
    }
    const userDto = JSON.parse(tempUser) as RegisterUserDTO;
    const user = await this.accountService.createNewUser(userDto);
    await this.redis.del(tempUserKey);

    req.session.tempSession = undefined;
    await this.saveSession({ id: user.id }, client);
  }

  /**
   * Сохранить сессию
   * @param sessionData
   * @param client
   */
  private async saveSession(sessionData: { id: string }, client: IClient) {
    const { req } = client;
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
