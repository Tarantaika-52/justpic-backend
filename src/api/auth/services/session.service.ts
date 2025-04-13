import { Injectable, Logger } from '@nestjs/common';
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

  /**
   * Завершить (удалить) сессию
   * @param req - Объект запроса
   */
  private async deleteSession(req: FastifyRequest) {
    req.session.destroy();
  }
}
