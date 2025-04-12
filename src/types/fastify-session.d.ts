import 'fastify';
import { Role } from 'prisma/__generated__';
declare module 'fastify' {
  interface Session {
    userSession?: {
      id: string;
      role: Role;
      client: {
        ip: string;
        ua: string;
      };
    };
    unverifiedSession?: {
      email: string;
    };
  }
}
