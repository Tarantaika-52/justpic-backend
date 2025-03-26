import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Эндпоинты для взаимодействия с авторизацией и аккаунтами
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Эндпоинт, возвращающий данные аккаунта пользователя по ключу сессии
   *
   * @param id - идентификатор пользователя, полученный из сессии
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  public async getMe(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    id: string,
  ) {
    reply.send();
  }

  /**
   * Эндпоинт входа в аккаунт
   *
   * @param req - объект запроса
   * @param reply - объект ответа
   * @param dto - данные для входа в аккаунт
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() dto: object,
  ) {
    reply.send();
  }

  /**
   * Эндпоинт подтверждения почты при регистрации
   *
   * @param req
   * @param reply
   * @param dto
   */
  @Post('confirm/email')
  @HttpCode(HttpStatus.OK)
  public async confirmEmail(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() dto: object,
  ) {
    reply.send();
  }

  /**
   * Эндпоинт подтверждения двухфакторной аутентификации
   *
   * @param req
   * @param reply
   * @param dto
   */
  @Post('confirm/tfa')
  @HttpCode(HttpStatus.OK)
  public async confirmTfa(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() dto: object,
  ) {
    reply.send();
  }

  /**
   * Эндпоинт регистрации аккаунта
   *
   * @param req
   * @param reply
   * @param dto
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() dto: object,
  ) {
    reply.send();
  }
}
