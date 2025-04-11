import 'fastify';
declare module 'fastify' {
  interface Session {
    userSession?: {
      id: string;
    };
    tempSession?: {
      email: string;
    };
  }
}
