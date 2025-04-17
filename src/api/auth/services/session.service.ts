import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Role } from 'prisma/__generated__';

@Injectable()
export class SessionService {
  private readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(SessionService.name);
  }

  /**
   * Сохранить сессию
   * @param id - ID пользователя
   * @param req - Объект запроса
   * @param role - Роль пользователя (По умолчанию: REGULAR)
   */
  public async saveSession(
    id: string,
    req: FastifyRequest,
    role: Role = 'REGULAR',
  ) {
    if (req.session.userSession) {
      throw new BadRequestException('Session already exists');
    }

    const sessionData = {
      user: {
        id,
        role,
      },
      client: {
        ip: req.ip,
        ua: req.headers['user-agent'],
      },
    };

    req.session.userSession = sessionData;
  }

  public async removePendingSession(req: FastifyRequest) {
    const session = req.session;
    session.pendingSession = undefined;
  }

  /**
   * Завершить (удалить) сессию
   * @param req - Объект запроса
   */
  public async clearSession(req: FastifyRequest) {
    if (!req.session.userSession) {
      throw new BadRequestException('Session does not exist');
    }

    await req.session.destroy();
    return { message: 'Successful logout' };
  }
}
