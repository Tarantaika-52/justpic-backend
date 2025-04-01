import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from 'fastify-cookie';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // Логирование для запросов
    }),
  );

  logger.log('Getting data from an .env file');
  const configService = app.get(ConfigService);
  const corsOrigins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((e) => e.trim());
  const appPort = configService.getOrThrow<number>('APP_PORT');
  const cookieSecret = configService.getOrThrow<string>('COOKIE_SECRET');
  const host = configService.getOrThrow<string>('APP_HOST');

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
    exposedHeaders: ['set-cookie'],
  });

  await app.register(fastifyCookie, {
    secret: cookieSecret,
    parseOptions: {},
  });

  await app.register(fastifyHelmet);

  try {
    await app.listen(appPort, '0.0.0.0');

    logger.log(`🚀 Server is running at: ${host}:${appPort}`);
    logger.log(`📄 Documentation is available at: ${host}:${appPort}/docs`);
  } catch (err) {
    logger.fatal(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
}
bootstrap();
