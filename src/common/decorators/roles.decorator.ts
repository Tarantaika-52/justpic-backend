import { SetMetadata } from '@nestjs/common';
import { Role } from 'prisma/__generated__';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
