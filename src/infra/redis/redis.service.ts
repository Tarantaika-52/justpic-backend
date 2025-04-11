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
