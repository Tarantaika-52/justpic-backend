import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LimiterService } from '../libs/limiter/limiter.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  public constructor(private readonly limiter: LimiterService) {}

  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const { ip } = req;

    await this.limiter.use({
      ip,
      actionKey: 'request',
      maxAttempts: 100,
      ttl: 300,
      message: 'Hush, hush! You are making requests too often.',
    });

    next();
  }
}
