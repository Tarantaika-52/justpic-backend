import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { FastifyRequest } from 'fastify';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger: Logger;
  constructor(private readonly reflector: Reflector) {
    this.logger = new Logger(RolesGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
    ]);

    if (!roles) {
      return true;
    }

    const req: FastifyRequest = context.switchToHttp().getRequest();
    const session = req.session.userSession;

    if (!roles.includes(session.user.role)) {
      this.logger.warn(
        `Access denied for user: ${session.user.id} (required: ${roles})`,
      );
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
