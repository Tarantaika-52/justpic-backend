import {
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
  public async getMeProfile(@Req() req: FastifyRequest) {
    return await this.profileService.findProfileFromSession(req);
  }

  @Get('u/:username')
  @HttpCode(HttpStatus.OK)
  public async getProfileByUsername(
    @Param('username') username: string,
    @Req() req: FastifyRequest,
  ) {
    return await this.profileService.findProfileByUsername(username, req);
  }

  @Patch('me/username')
  @HttpCode(HttpStatus.OK)
  public async changeUsername(@Req() req: FastifyRequest) {
    return;
  }

  @Patch('me/bio')
  @HttpCode(HttpStatus.OK)
  public async changeBio(@Req() req: FastifyRequest) {
    return;
  }

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  public async changeAvatar(@Req() req: FastifyRequest) {
    await req.file();
  }

  @Patch('me/banner')
  @HttpCode(HttpStatus.OK)
  public async changeBanner(@Req() req: FastifyRequest) {
    await req.file();
  }
}
