import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { ProfileModule } from './profile/profile.module';
import { CommonModule } from 'src/common';

@Module({
  imports: [AuthModule, AccountsModule, ProfileModule, CommonModule],
  exports: [AccountsModule],
})
export class ApiModule {}
