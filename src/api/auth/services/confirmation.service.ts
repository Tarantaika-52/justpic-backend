import { FastifySessionObject } from '@fastify/session';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FastifyRequest } from 'fastify';
import { AccountsService } from 'src/api/accounts/accounts.service';
import { ConfirmAccountDTO, RegisterUserDTO } from 'src/common/dto/users';
import {
  IClient,
  IConfirmationCode,
  IRegistrationPending,
} from 'src/common/interfaces';
import { LimiterService } from 'src/common/libs/limiter/limiter.service';
import {
  getRegisterPendingKey,
  getRegistrationCodeKey,
} from 'src/common/utils';
import { MailService } from 'src/infra/mail/mail.service';
import { RedisService } from 'src/infra/redis/redis.service';
import { SessionService } from './session.service';

/**
 * Сервис для работы с кодами подтверждения (MFA, подтверждение регистрации)
 */
@Injectable()
export class ConfirmationService {
  private readonly logger: Logger;

  public constructor(
    private readonly accountService: AccountsService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private readonly redis: RedisService,
    private readonly limiter: LimiterService,
  ) {
    this.logger = new Logger(ConfirmationService.name);
  }

  /**
   * Метод запрашивает новый код подтверждения через объект запроса
   *
   * @param req - Объект запроса
   */
  public async requestNewConfirmationCode(req: FastifyRequest) {
    const ip: string = req.ip;

    const pendingSession = this.getPendingSessionOrThrow(req);
    const pendingAccount = await this.getPendingAccountOrThrow(pendingSession);

    const email = pendingAccount.email;
    await this.sendConfirmationCode(email, ip);

    return {
      message: 'The confirmation code was sent to the specified email address.',
      details: {
        email,
      },
    };
  }

  /**
   * Метод генерирует и отправляет код подтверждения
   * на указанный адрес электронной почты
   *
   * @param email - Email пользователя
   * @param ip - IP-адрес пользователя
   */
  public async sendConfirmationCode(email: string, ip: string): Promise<void> {
    await this.limiter.use({
      ip,
      actionKey: 'send-code',
      maxAttempts: 5,
      ttl: 900,
    });

    const code: string = this.generateConfirmationCode();
    const confirmationCode: IConfirmationCode = { code, email };

    await this.saveConfirmationCode(confirmationCode);
    await this.mailService.sendMailWithCode(confirmationCode);
  }

  /**
   * Метод генерирует случайный код подтверждения из 6 символов
   */
  private generateConfirmationCode(): string {
    return randomUUID().trim().slice(0, 6).toUpperCase();
  }

  /**
   * Метод сохраняет код подтверждения в Redis для дальнейшего использования
   */
  private async saveConfirmationCode(data: IConfirmationCode): Promise<void> {
    const email: string = data.email;
    const code: string = data.code;
    const key: string = getRegistrationCodeKey(email);

    await this.redis.set(key, code, 'EX', 900);
  }

  /**
   * Подтвердить регистрацию через код и войти в зарегистрированный аккаунт
   *
   * @param dto
   * @param client
   */
  public async confirmRegistrationFromSession(
    dto: ConfirmAccountDTO,
    client: IClient,
  ) {
    const { req, ip } = client;

    await this.limiter.use({
      ip,
      actionKey: 'confirm-registration',
      maxAttempts: 5,
      ttl: 600,
    });

    if (req.session.userSession) {
      await this.sessionService.removePendingSession(req);
      throw new BadRequestException('The account has already been verified.');
    }

    const rawCode: string = dto.code;
    const { code, key: codeKey } = await this.getCodeBySession(req);

    if (rawCode !== code) {
      throw new ForbiddenException('Incorrect confirm code');
    }

    const usr = await this.createConfirmedAccount(req.session.pendingSession);

    await this.redis.del(codeKey);

    await this.sessionService.removePendingSession(req);
    await this.sessionService.saveSession(usr.id, req);

    this.logger.log(
      `Account verified from ip ${ip} using the code: ${rawCode}`,
    );
    return {
      message: 'Account confirmed successfully',
      details: {
        ip,
      },
    };
  }

  /**
   * Метод получает код подтверждения, сохраненный в Redis,
   * используя данные pending-сессии
   */
  private async getCodeBySession(req: FastifyRequest) {
    const pendingSession = this.getPendingSessionOrThrow(req);

    const email: string = pendingSession.email;
    const key: string = getRegistrationCodeKey(email);

    const code: string = await this.redis.get(key);

    if (!code) {
      await this.requestNewConfirmationCode(req);
      throw new BadRequestException(
        'The code expired. A new code has been sent to your email',
      );
    }

    return { code, key };
  }

  /**
   * Создает новый аккаунт на базе неподтвержденного временного аккаунта
   *
   * @param pendingSession
   */
  private async createConfirmedAccount(
    pendingSession: FastifySessionObject['pendingSession'],
  ) {
    const pending = await this.getPendingAccountOrThrow(pendingSession);
    const dto: RegisterUserDTO = pending;

    const usr = await this.accountService.allowRegistrationPending(dto);
    await this.redis.del(pending.key);
    return usr;
  }

  /**
   * Проверить существование pending-сессии
   *
   * @param req - Объект запроса
   */
  private getPendingSessionOrThrow(req: FastifyRequest) {
    const pendingSession = req.session.pendingSession;
    if (!pendingSession) {
      throw new BadRequestException('Session does not contain pending data');
    }

    return pendingSession;
  }

  private async getPendingAccountOrThrow(
    pendingSession: FastifySessionObject['pendingSession'],
  ): Promise<IRegistrationPending> {
    const email: string = pendingSession.email;
    const key = getRegisterPendingKey(email);
    const registrationPending = JSON.parse(await this.redis.get(key));

    if (!registrationPending) {
      throw new ForbiddenException('Account verification period has expired');
    }

    return { ...registrationPending, key };
  }
}
