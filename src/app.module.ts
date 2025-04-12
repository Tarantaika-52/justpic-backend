import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api';
import { CommonModule } from './common';
import { InfraModule } from './infra/infra.module';
import { UserAgentMiddleware } from './common/middlewares/user-agent.middleware';
import { RateLimitMiddleware } from './common/middlewares/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ApiModule,
    CommonModule,
    InfraModule,
  ],
})
// todo: добавить middleware для ограничения запросов в минуту с одного IP
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAgentMiddleware).forRoutes('*');
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
