import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api';
import { CommonModule } from './common';
import { InfraModule } from './infra/infra.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
    }),
    ApiModule,
    CommonModule,
    InfraModule,
  ],
})
export class AppModule {}
