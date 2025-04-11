import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RepositoriesModule } from 'src/common/repositories/repositories.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [RepositoriesModule, AccountsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
