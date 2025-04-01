import { Module } from '@nestjs/common';
import { AccountRepository } from 'src/common/repositories';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, AccountRepository],
})
export class AuthModule {}
