import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ILimiter } from 'src/common/interfaces';
import { getActionRateLimitKey } from 'src/common/utils';
import { RedisService } from 'src/infra/redis/redis.service';

@Injectable()
export class LimiterService {
  private readonly logger: Logger;

  public constructor(private readonly redis: RedisService) {
    this.logger = new Logger(LimiterService.name);
  }

  /**
   * Ограничивает количество запросов на указанное действие с определенного IP
   * @param params - параметры
   */
  public async use(params: ILimiter) {
    const { ip, actionKey, maxAttempts, ttl, message } = params;
    const key: string = getActionRateLimitKey(ip, actionKey);
    let attempts: number = 0;

    try {
      attempts = await this.redis.incr(key);

      if (attempts == 1) {
        await this.redis.expire(key, ttl);
      }
    } catch (err) {
      const msg: string = 'Could not check the number of attempts';
      this.logger.error(msg);
      throw new InternalServerErrorException(msg);
    }

    if (attempts > maxAttempts) {
      this.logger.log(`👀 Too many attempts for ${key} from ${ip}`);
      throw new HttpException(
        {
          message: message ?? 'Too many attempts',
          error: 'Too many requests',
          statusCode: 429,
        },
        429,
      );
    }

    return attempts;
  }
}
