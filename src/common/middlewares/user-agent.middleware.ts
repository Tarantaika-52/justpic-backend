import {
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

const botSignatures = [
  'curl/',
  'wget/',
  'python-requests',
  'axios/',
  'scrapy',
  'libwww-perl',
  'php/',
  'java/',
  'ruby',
  'node-fetch',
  // 'postman',
];

@Injectable()
export class UserAgentMiddleware implements NestMiddleware {
  logger: Logger;

  public constructor() {
    this.logger = new Logger(UserAgentMiddleware.name);
  }

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const userAgent = req.headers['user-agent'];
    const isSuspicious: boolean = this.isSuspiciousUserAgent(userAgent);
    if (isSuspicious) {
      const ip = req['ip'];
      this.logger.log(`🤬 Suspicious UA from IP ${ip}: ${userAgent}`);
      throw new ForbiddenException(
        'Hmmm... sorry, the request looks suspicious and we cannot process it.',
      );
    }

    next();
  }

  private isSuspiciousUserAgent(userAgent: string | undefined): boolean {
    if (!userAgent || userAgent.length < 10) {
      return true;
    }

    const ua = userAgent.trim().toLowerCase();
    return botSignatures.some((sign) => ua.includes(sign));
  }
}
