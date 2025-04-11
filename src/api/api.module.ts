import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { ProfileModule } from './profile/profile.module';
import { CommonModule } from 'src/common';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    AuthModule,
    AccountsModule,
    ProfileModule,
    CommonModule,
    MetricsModule,
  ],
  exports: [AccountsModule],
})
export class ApiModule {}
