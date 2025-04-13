import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FastifyRequest } from 'fastify';
import { AccountsService } from 'src/api/accounts/accounts.service';
import { ConfirmAccountDTO } from 'src/common/dto/users';
import { IClient, IConfirmationCode } from 'src/common/interfaces';
import { LimiterService } from 'src/common/libs/limiter/limiter.service';
import { getRegistrationCodeKey } from 'src/common/utils';
import { MailService } from 'src/infra/mail/mail.service';
import { RedisService } from 'src/infra/redis/redis.service';

/**
 * Сервис для работы с кодами подтверждения (MFA, подтверждение регистрации)
 */
@Injectable()
export class ConfirmationService {
  private readonly logger: Logger;

  public constructor(
    private readonly accountService: AccountsService,
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
    const pendingSession = req.session.pendingSession;
    if (!pendingSession) {
      throw new BadRequestException('Session does not contain pending data');
    }

    const email = pendingSession.email;
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
    if (!email || !ip) {
      throw new BadRequestException('Necessary parameters are missing');
    }

    await this.limiter.use({
      ip,
      actionKey: 'send-code',
      maxAttempts: 5,
      ttl: 900,
    });

    const code: string = await this.generateConfirmationCode();
    const confirmationCode: IConfirmationCode = { code, email };

    await this.saveConfirmationCode(confirmationCode);
    await this.sendConfirmationEmail(confirmationCode);
  }

  /**
   * Метод генерирует случайный код подтверждения из 6 символов
   */
  private async generateConfirmationCode(): Promise<string> {
    try {
      const code = randomUUID().trim().slice(0, 6).toUpperCase();

      return code;
    } catch (err) {
      this.logger.error('Could not generate confirmation code');
      throw new InternalServerErrorException(
        'Could not generate confirmation code',
      );
    }
  }

  /**
   * Метод сохраняет код подтверждения в Redis для дальнейшего использования
   */
  private async saveConfirmationCode(data: IConfirmationCode): Promise<void> {
    const email: string = data.email;
    const json: string = JSON.stringify(data);
    const key: string = getRegistrationCodeKey(email);

    try {
      await this.redis.set(key, json, 'EX', 900);
    } catch (err) {
      this.logger.error('Could not save authorization code in redis');
      throw new InternalServerErrorException(
        'Could not generate confirmation code',
      );
    }
  }

  /**
   * Метод отправляет письмо с кодом подтверждения
   * на указанный адрес электронной почты
   */
  private async sendConfirmationEmail(data: IConfirmationCode): Promise<void> {
    try {
      await this.mailService.sendMailWithCode(data);
    } catch (err) {
      this.logger.error('Could not send authorization code to email');
      throw new InternalServerErrorException(
        'Could not send confirmation code',
      );
    }
  }

  /**
   * Подтвердить регистрацию через код и войти в зарегистрированный аккаунт
   *
   * @param dto
   * @param client
   */
  public async confirmRegistrationPending(
    dto: ConfirmAccountDTO,
    client: IClient,
  ) {
    const { req, ip } = client;
    const code: string = dto.code;

    await this.limiter.use({
      ip,
      actionKey: 'confirm-registration',
      maxAttempts: 5,
      ttl: 600,
    });
  }
}
