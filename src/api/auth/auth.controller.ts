import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from 'src/common/dto/user/register-user.dto';
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
    @Body() dto: RegisterUserDTO,
    @Ip() clientIP: string,
  ) {
    return await this.accountService.createNewUser(dto, clientIP);
  }
}
