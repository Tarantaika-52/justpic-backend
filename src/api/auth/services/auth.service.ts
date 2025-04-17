import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { verify } from 'argon2';
import { LoginDto, RegisterUserDTO } from 'src/common/dto/users';
import { IClient } from 'src/common/interfaces';
import { AccountRepository } from 'src/common/repositories/accounts.repository';
import { AccountsService } from '../../accounts/accounts.service';
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

    // todo: добавить проверку на существование запроса на регистрацию с таким email. В случае, если пароль не сходится, выкинуть исключение. Если пароль подходит, выполнить вход в неподтвержденный аккаунт и если кода подтверждения нет, отправить новый.

    await this.accountService.createRegistrationPending(dto);
    await this.confirmationService.sendConfirmationCode(email, ip);
    await this.savePendingSession(email, req);

    return {
      message:
        'Its almost done. It remains to confirm the account using a code sent to the specified email address.',
    };
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
