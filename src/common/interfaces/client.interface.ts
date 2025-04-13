import { FastifyReply, FastifyRequest } from 'fastify';

export interface IClient {
  ip: string;
  req: FastifyRequest;
  res: FastifyReply;
}
