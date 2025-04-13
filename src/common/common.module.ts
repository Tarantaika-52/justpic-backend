import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories/repositories.module';
import { LimiterModule } from './libs/limiter/limiter.module';

@Module({
  imports: [RepositoriesModule, LimiterModule],
  exports: [RepositoriesModule, LimiterModule],
})
export class CommonModule {}
