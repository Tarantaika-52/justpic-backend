import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { RepositoriesModule } from 'src/common/repositories/repositories.module';
import { AccountsModule } from '../accounts/accounts.module';
import { ConfirmationService } from './services/confirmation.service';
import { SessionService } from './services/session.service';

@Module({
  imports: [RepositoriesModule, AccountsModule],
  controllers: [AuthController],
  providers: [AuthService, ConfirmationService, SessionService],
})
export class AuthModule {}
