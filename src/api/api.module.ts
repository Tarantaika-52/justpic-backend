import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AccountModule } from './account/account.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, AccountModule, ProfileModule],
  // Подключение автоматического кеширования GET-запросов
  providers: [{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class ApiModule {}
