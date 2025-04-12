import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { RedisService } from './infra/redis/redis.service';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { RedisStore } from 'connect-redis';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 16 * 1024 * 1024,
    }),
  );

  logger.log('⚙️ Getting config...');
  const configService = app.get(ConfigService);
  const corsOrigins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((e) => e.trim());
  const appPort = configService.getOrThrow<number>('APP_PORT');
  const cookieSecret = configService.getOrThrow<string>('COOKIE_SECRET');

  const redisService = app.get(RedisService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    exposedHeaders: ['set-cookie'],
  });

  await app.register(fastifyCookie, { secret: cookieSecret });
  await app.register(fastifySession, {
    secret: cookieSecret,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
    },
    store: new RedisStore({ client: redisService }),
  });
  await app.register(fastifyHelmet);
  await app.register(fastifyMultipart, {
    limits: {
      files: 1,
      fileSize: 48,
      fields: 10,
    },
  });

  try {
    await app.listen(appPort, '0.0.0.0');

    logger.log(`🚀 Server is running at localhost:${appPort}`);
  } catch (err) {
    logger.fatal(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
}
bootstrap();
