import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  public constructor() {
    this.logger = new Logger(LoggerMiddleware.name);
  }

  use(req: FastifyRequest, res: any, next: () => void) {
    this.logger.log(
      `📩 Request from: ${req.ip}; For router: ${req.originalUrl};`,
    );

    next();
  }
}
