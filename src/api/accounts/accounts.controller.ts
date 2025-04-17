import { FastifyRequest } from 'fastify';
import { AccountsService } from './accounts.service';
import { Get, Controller, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Auth } from 'src/common/decorators';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  /**
   * Получить данные пользователя из сессии
   * @returns
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Auth()
  public async getMe(@Req() req: FastifyRequest) {
    return await this.accountService.getUserBySession(req);
  }
}
