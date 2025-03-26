import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';

/**
 * Эндпоинты для взаимодействия с профилями
 */
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
}
