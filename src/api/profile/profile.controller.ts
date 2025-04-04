import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FastifyRequest } from 'fastify';

@UseInterceptors(CacheInterceptor)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(2000)
  public async getMeProfile() {
    return;
  }

  @Get('id/:id')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(2000)
  public async getProfileByID(@Param('id') id: string) {
    return;
  }

  @Get('u/:username')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(6000)
  public async getProfileByUsername(@Param('username') username: string) {
    return;
  }

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  public async changeAvatar(@Req() req: FastifyRequest) {
    const file = await req.file();

    if (!file) {
      throw new BadRequestException('File not uploaded');
    }

    console.log(file.filename);

    return true;
  }
}
