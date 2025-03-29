import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountRepository } from 'src/common/repositories';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccountRepository],
})
export class AuthModule {}
