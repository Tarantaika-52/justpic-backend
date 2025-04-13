import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const { userSession, pendingSession: unverifiedSession } = req.session;

    if (unverifiedSession) {
      throw new ForbiddenException(
        'You will not be able to use your account until you confirm its registration.',
      );
    }

    if (!userSession) {
      throw new ForbiddenException('Invalid session');
    }

    return true;
  }
}
