import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FastifyRequest } from 'fastify';

@UseInterceptors(CacheInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(1000)
  public async getAuthorizedUser() {
    return;
  }

  @Get('u/:username')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(2000)
  public async getUserByUsername(@Param('username') username: string) {
    return;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  public async patchUser() {
    return;
  }

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  public async changeAvatar(@Req() req: FastifyRequest) {
    const mp = await req.file();

    console.log(mp.filename);

    return mp.filename;
  }
}
