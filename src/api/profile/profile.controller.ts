import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FastifyRequest } from 'fastify';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  public async getMeProfile() {
    return;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async getProfileByID(@Param('id') id: string) {
    return;
  }

  @Get('u/:username')
  @HttpCode(HttpStatus.OK)
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
