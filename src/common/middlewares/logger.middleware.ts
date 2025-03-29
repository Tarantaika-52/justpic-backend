import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger: Logger;

  constructor() {
    this.logger = new Logger(LoggerMiddleware.name);
  }

  use(
    req: FastifyRequest['body'],
    reply: FastifyReply['raw'],
    next: () => void,
  ) {
    this.handleRequestBody(req);
    next();
  }

  private handleRequestBody(request: FastifyRequest['body']): void {
    const req = request as FastifyRequest;
    this.logger.log(`${req.id}:${req.ip}`);
  }
}
