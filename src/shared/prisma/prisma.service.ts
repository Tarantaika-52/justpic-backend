import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from 'prisma/__generated__';

/**
 * Service for integration with Prisma
 * Allows direct interaction with the Prisma API
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger;

  /**
   * Class constructor
   */
  public constructor() {
    super();
    this.logger = new Logger(PrismaService.name);
  }

  /**
   * The onModuleInit method initiates a
   * connection to the database via PrismaClient
   */
  public async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Successful connection to PrismaClient');
    } catch (err) {
      this.logger.fatal(`❌ Failed to connect to Prisma: ${err.message}`);
      throw err;
    }
  }

  /**
   * The onModuleDestroy method is responsible for the
   * correct shutdown by disconnecting from the database
   */
  public async onModuleDestroy() {
    await this.$disconnect();
  }
}
