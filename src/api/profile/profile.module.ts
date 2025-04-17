import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { RepositoriesModule } from 'src/common/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
