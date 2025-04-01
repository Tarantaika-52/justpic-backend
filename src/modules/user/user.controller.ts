import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete('dev/delete')
  @HttpCode(HttpStatus.OK)
  public async forceDelete(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Query('id') id: string,
  ) {
    await this.userService.forceDeleteUser(id, req, reply);
  }
}
