import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Module({
  imports: [UserModule, AuthModule],
  // Подключение автоматического кеширования GET-запросов
  providers: [{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class ApiModule {}
