import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  logger: Logger;

  constructor() {
    this.logger = new Logger(SecurityMiddleware.name);
  }

  use(
    req: FastifyRequest['body'],
    reply: FastifyReply['raw'],
    next: () => void,
  ) {
    this.handleRequestBody(req);
    this.appendHeaders(reply);
    next();
  }

  private appendHeaders(reply: FastifyReply['raw']): void {
    reply.setHeader('Justpic-Version', '25.03-a');
  }

  private handleRequestBody(request: FastifyRequest['body']): void {
    // const req = request as FastifyRequest;
  }
}
