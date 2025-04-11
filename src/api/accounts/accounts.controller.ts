import { FastifyRequest } from 'fastify';
import { AccountsService } from './accounts.service';
import {
  Get,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  /**
   * WARNING!!!
   * DEBUG ONLY!!!
   * NOT FOR PRODUCTION!!!
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getAll() {
    return await this.accountService.getAll();
  }

  /**
   * Получить данные пользователя
   * @returns
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  public async getMe(@Req() req: FastifyRequest) {
    return await this.accountService.getUserBySession(req);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async getById(@Param('id') id: string) {
    const user = await this.accountService.getById(id);
    return {
      user,
    };
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  public async deleteById(@Param('id') id: string) {
    return await this.accountService.delete(id);
  }
}
