import {
  HttpException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RedisService } from 'src/infra/redis/redis.service';
import { requestRatelimitKey } from '../utils';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  logger: Logger;

  public constructor(private readonly redis: RedisService) {
    this.logger = new Logger(RateLimitMiddleware.name);
  }

  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const { ip } = req;
    const redisKey = requestRatelimitKey(ip);

    const attempts = await this.redis.incr(redisKey);
    if (attempts == 1) {
      await this.redis.expire(redisKey, 300);
    }

    if (attempts > 100) {
      throw new HttpException(
        {
          message: 'Hush, hush! You are making requests too often.',
          error: 'Too many requests',
          statusCode: 429,
        },
        429,
      );
    } else {
      next();
    }
  }
}
