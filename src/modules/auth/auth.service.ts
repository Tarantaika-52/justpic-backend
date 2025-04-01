import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AccountRepository } from 'src/common/repositories';

/**
 * Business logic for working with authorization
 */
@Injectable()
export class AuthService {
  private readonly logger: Logger;

  /**
   * Class constructor
   */
  public constructor(private readonly repository: AccountRepository) {
    this.logger = new Logger(AuthService.name);
  }

  /**
   * Account login function
   * @param dto
   * @returns
   */
  public async login(dto: object, req: FastifyRequest, res: FastifyReply) {
    try {
      //
    } catch (err) {
      this.logger.error(
        `There was an error logging into account: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * Account logout function
   * @returns
   */
  public async logout(req: FastifyRequest, res: FastifyReply) {
    try {
      //
    } catch (err) {
      this.logger.error(
        `An error occurred while logging out of account: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * Password reset function
   * @param dto
   */
  public async resetPassword(
    dto: object,
    req: FastifyRequest,
    res: FastifyReply,
  ) {
    try {
      //
    } catch (err) {
      this.logger.error(
        `An error occurred while resetting password: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * The function enables/disables TFA
   * for the user
   * @param dto
   */
  public async setTwoFactorAuth(
    dto: object,
    req: FastifyRequest,
    res: FastifyReply,
  ) {
    try {
      //
    } catch (err) {
      this.logger.error(
        `An error occurred while changing TFA state: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }
}
