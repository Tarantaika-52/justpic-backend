export interface ILimiter {
  ip: string;
  actionKey: string;
  maxAttempts: number;
  ttl: number;
  message?: string;
}
