import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger: Logger;

  /**
   * Конструктор класса :3
   * @param config
   */
  public constructor(private readonly config: ConfigService) {
    const resendKey: string = config.getOrThrow<string>('RESEND_KEY');
    this.resend = new Resend(resendKey);
    this.logger = new Logger(MailService.name);
    this.logger.log('✅ Resend connected successfully');
  }

  /**
   * Отправить письмо с указанными параметрами
   * @param params
   */
  public async sendMail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    await this.resend.emails.send({
      from: 'justpic-test <justpic@resend.dev>',
      ...params,
    });

    this.logger.log(`✉️ A letter has been sent to the address: ${params.to}`);
  }

  public async sendMailWithCode(params: { email: string; code: string }) {
    const { email, code } = params;

    await this.sendMail({
      to: email,
      subject: 'Подтверждение регистрации аккаунта',
      html: `<p>Ваш код подтверждения: ${code}</p>`,
    });
  }
}
