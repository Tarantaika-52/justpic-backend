import 'fastify';
import { Role } from 'prisma/__generated__';
declare module 'fastify' {
  interface Session {
    /**
     * Подтвержденная сессия для пользователя, вошедшего в аккаунт
     */
    userSession?: {
      user: {
        id: string;
        role: Role;
      };
      client: {
        ip: string;
        ua: string;
      };
    };

    /**
     * Сессия для неподтвержденного аккаунта
     */
    pendingSession?: {
      email: string;
    };
  }
}
