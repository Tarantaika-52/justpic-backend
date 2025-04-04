import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from 'src/common/dto/user/register-user.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AccountService } from '../account/account.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async registerUser(
    @Req() req: FastifyRequest,
    @Res() rep: FastifyReply,
    @Body() dto: RegisterUserDTO,
  ) {
    await this.accountService.createNewUser(dto);
  }
}
