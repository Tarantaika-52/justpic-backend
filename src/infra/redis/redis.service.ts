import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger;

  public constructor(private readonly configService: ConfigService) {
    super(configService.getOrThrow<string>('REDIS_URI'));
    this.logger = new Logger(RedisService.name);
  }

  /**
   * Обертка для кеширования
   *
   * @param key - ключ
   * @param ttl - время хранения кеша
   * @param fallbackFunc - фалл бек
   */
  public async wrapInCache<T>(
    key: string,
    ttl: number,
    fallbackFunc: () => Promise<T>,
  ) {
    const cache = await this.get(key);
    if (cache) {
      try {
        return JSON.parse(cache);
      } catch (err) {
        this.logger.error(`Failed to parse cache with key: ${key}`, err);
        await this.del(key);
      }
    }

    try {
      const data = await fallbackFunc();
      if (!data) {
        return null;
      }

      await this.set(key, JSON.stringify(data), 'EX', ttl);
      return data;
    } catch (err) {
      this.logger.error(`Wrapper fallback error for key: ${key}`, err);
      throw err;
    }
  }

  public async onModuleInit() {
    this.logger.log('🔄 Initializing Redis connection...');

    this.on('error', (err) => {
      this.logger.error('❌ Failed to connect to Redis:', err);
    });
  }

  public async onModuleDestroy() {
    this.logger.log('🔻 Shutting down Redis connection...');

    try {
      await this.quit();
      this.logger.log('🟢 Redis connection closed successfully.');
    } catch (error) {
      this.logger.error('⚠️ Error while shutting down Redis connection', error);
      throw error;
    }
  }
}
