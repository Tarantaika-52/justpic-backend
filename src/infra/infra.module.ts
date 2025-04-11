import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [PrismaModule, RedisModule, MailModule],
  exports: [PrismaModule, RedisModule, MailModule],
})
export class InfraModule {}
