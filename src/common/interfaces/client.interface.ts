import { FastifyReply, FastifyRequest } from 'fastify';

export interface IClient {
  clientIp: string;
  req: FastifyRequest;
  res: FastifyReply;
}
