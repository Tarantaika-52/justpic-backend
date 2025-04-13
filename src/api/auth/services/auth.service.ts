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
import { IClient } from 'src/common/interfaces';
import { AccountRepository } from 'src/common/repositories/accounts.repository';
import { AccountsService } from '../../accounts/accounts.service';
import { RedisService } from 'src/infra/redis/redis.service';
import {
  getRegisterPendingKey,
  getRegistrationCodeKey,
} from 'src/common/utils';
import { ConfirmationService } from './confirmation.service';
import { FastifyRequest } from 'fastify';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  public constructor(
    private readonly repo: AccountRepository,
    private readonly confirmationService: ConfirmationService,
    private readonly sessionService: SessionService,
    private readonly accountService: AccountsService,
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

    // todo: Добавить возможность войти в неподтвержденный аккаунт для подтверждения регистрации

    const unverifiedSession = req.session.pendingSession;
    if (unverifiedSession) {
      throw new ForbiddenException(
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
    await this.sessionService.saveSession(id, req, role);

    return {
      message: 'Successful authorization',
      details: {
        id: user.id,
        ip: client.ip,
      },
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
    const { req, ip } = client;
    const { email } = dto;

    const session = req.session.userSession;

    if (session) {
      throw new BadRequestException('Account login has already been completed');
    }

    // todo: добавить проверку на существование запроса на регистрацию с таким email. В случае, если пароль не сходится, выкинуть исключение. Если пароль подходит, выполнить вход в неподтвержденный аккаунт и, если кода подтверждения нет, отправить новый.

    await this.accountService.createRegistrationPending(dto);
    await this.confirmationService.sendConfirmationCode(email, ip);
    await this.savePendingSession(email, req);

    return {
      message:
        'Its almost done. It remains to confirm the account using a code sent to the specified email address.',
    };
  }

  /**
   * Подтвердить почту через код из письма
   * @param email
   * @param code
   */
  public async confirmAccount(dto: ConfirmAccountDTO, client: IClient) {
    const { req, ip } = client;
    const { code } = dto;

    const userSession = req.session.userSession;
    if (userSession) {
      throw new BadRequestException('The account has already been verified.');
    }
    const unverifiedSession = req.session.pendingSession;
    if (!unverifiedSession) {
      throw new BadRequestException('Unable to verify non-existent account');
    }

    const { email } = unverifiedSession;
    const redisKey = getRegistrationCodeKey(email);
    const savedCodeJSON = await this.redis.get(redisKey);
    if (!savedCodeJSON) {
      await this.confirmationService.sendConfirmationCode(email, ip);
      throw new BadRequestException(
        'The code expired. A new code has been sent to your email',
      );
    }
    const savedCodeObject = JSON.parse(savedCodeJSON);

    const savedCode = savedCodeObject.code;

    const isCorrectCode = code == savedCode;
    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect confirm code');
    }

    await this.redis.del(redisKey);

    const tempUserKey = getRegisterPendingKey(email);
    const tempUser = await this.redis.get(tempUserKey);
    if (!tempUser) {
      throw new ForbiddenException('Account verification period has expired');
    }
    const userDto = JSON.parse(tempUser) as RegisterUserDTO;
    const user = await this.accountService.allowRegistrationPending(userDto);
    await this.redis.del(tempUserKey);

    req.session.pendingSession = undefined;
    await this.sessionService.saveSession(user.id, req);

    return { message: 'Account confirmed' };
  }

  /**
   * Сохранить неподтвержденную сессию
   * @param email
   * @param client
   */
  private async savePendingSession(email: string, req: FastifyRequest) {
    req.session.pendingSession = { email };
  }
}
