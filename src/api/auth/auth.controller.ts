import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ConfirmAccountDTO,
  LoginDto,
  RegisterUserDTO,
} from 'src/common/dto/users';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async registerUser(
    @Body() dto: RegisterUserDTO,
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return await this.authService.register(dto, { clientIp, req, res });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginDto,
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return await this.authService.login(dto, { clientIp, req, res });
  }

  @Post('confirm')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  public async confirmRegistration(
    @Body() dto: ConfirmAccountDTO,
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return await this.authService.confirmAccount(dto, { clientIp, req, res });
  }
}
