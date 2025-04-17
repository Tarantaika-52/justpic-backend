import { Module } from '@nestjs/common';
import { AccountRepository } from './accounts.repository';
import { ProfileRepository } from './profile.repository';

@Module({
  providers: [AccountRepository, ProfileRepository],
  exports: [AccountRepository, ProfileRepository],
})
export class RepositoriesModule {}
