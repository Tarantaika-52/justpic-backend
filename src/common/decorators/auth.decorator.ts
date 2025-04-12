import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from 'prisma/__generated__';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards';

export function Auth(...roles: Role[]) {
  if (roles.length > 0) {
    return applyDecorators(Roles(...roles), UseGuards(RolesGuard));
  }
}
