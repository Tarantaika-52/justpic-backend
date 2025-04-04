import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountService } from '../account/account.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccountService],
})
export class AuthModule {}
