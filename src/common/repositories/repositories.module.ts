import { Module } from '@nestjs/common';
import { AccountRepository } from './accounts.repository';

@Module({
  providers: [AccountRepository],
  exports: [AccountRepository],
})
export class RepositoriesModule {}
