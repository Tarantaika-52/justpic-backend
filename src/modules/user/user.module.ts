import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AccountRepository } from 'src/common/repositories';

@Module({
  controllers: [UserController],
  providers: [UserService, AccountRepository],
})
export class UserModule {}
