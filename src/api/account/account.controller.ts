import { AccountService } from './account.service';
import {
  Get,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Получить данные пользователя
   * @returns
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(1000)
  public async getMe() {
    return;
  }

  /**
   * Обновить данные пользователя
   * @returns
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  public async patchMe() {
    return;
  }
}
