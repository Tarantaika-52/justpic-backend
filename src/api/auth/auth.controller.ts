import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import {
  ConfirmAccountDTO,
  LoginDto,
  RegisterUserDTO,
} from 'src/common/dto/users';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ConfirmationService } from './services/confirmation.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService,
  ) {}

  /**
   * Создание запроса на регистрацию нового пользователя
   * @param dto - данные для создания пользователя
   * @param clientIp - IP клиента
   * @param req - запрос
   * @param res - ответ
   * @returns
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async registerUser(
    @Body() dto: RegisterUserDTO,
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return await this.authService.register(dto, { ip: clientIp, req, res });
  }

  /**
   * Вход в аккаунт
   * @param dto - данные для входа
   * @param clientIp - IP клиента
   * @param req - запрос
   * @param res - ответ
   * @returns
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginDto,
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return await this.authService.login(dto, { ip: clientIp, req, res });
  }

  /**
   * Подтвердить почту и создать аккаунт
   * @param dto - данные для подтверждения
   * @param clientIp - IP клиента
   * @param req - запрос
   * @param res - ответ
   * @returns
   */
  @Post('confirm')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  public async confirmRegistration(
    @Body() dto: ConfirmAccountDTO,
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return await this.authService.confirmAccount(dto, {
      ip: clientIp,
      req,
      res,
    });
  }

  @Get('new-code')
  @HttpCode(HttpStatus.OK)
  public async requestNewConfirmationCode(@Req() req: FastifyRequest) {
    return await this.confirmationService.requestNewConfirmationCode(req);
  }

  /**
   * Авторизация через куки при заходе на сайт
   * @param clientIp - IP клиента
   * @param req - запрос
   * @param res - ответ
   */
  @Post('me')
  @HttpCode(HttpStatus.OK)
  public async authMe(
    @Ip() clientIp: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    //
  }
}
