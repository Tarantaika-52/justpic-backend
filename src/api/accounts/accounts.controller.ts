import { FastifyRequest } from 'fastify';
import { AccountsService } from './accounts.service';
import { Get, Controller, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Auth } from 'src/common/decorators';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth('ADMIN')
  public async getAll() {
    return;
  }

  /**
   * Получить данные пользователя из сессии
   * @returns
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  public async getMe(@Req() req: FastifyRequest) {
    // todo: добавить проверку на украденные куки
    return await this.accountService.getUserBySession(req);
  }
}
