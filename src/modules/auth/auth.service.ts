import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterUserDto } from 'src/common/dto/user';
import { AccountRepository } from 'src/common/repositories';

/**
 * Business logic for working with authorization and accounts
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
   * The function returns the user by ID
   * or throws an exception
   * @param id - user id
   */
  public async getByIdOrThrow(id: string) {
    try {
      //
    } catch (err) {
      this.logger.error(`Error getting user by id: ${err.stack}`);
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * The function finds and returns the user
   * by email address
   * @param email - user email
   */
  public async getByEmail(email: string) {
    try {
      //
    } catch (err) {
      this.logger.error(`Error getting user by email: ${err.stack}`);
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * The function checks the existence of an account
   * by email address
   * @param email - user email
   */
  private async checkAccountExistByEmail(email: string): Promise<boolean> {
    try {
      //
      return email != null;
    } catch (err) {
      this.logger.error(
        `Error checking account existence by email address: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * The function creates a new user
   * with data from the DTO
   * @param dto - new user details
   */
  public async createUser(
    dto: RegisterUserDto,
    req: FastifyRequest,
    res: FastifyReply,
  ) {
    const isUserExist: boolean = await this.checkAccountExistByEmail(dto.email);
    if (!isUserExist) {
      throw new InternalServerErrorException(
        'Email is not available for registration',
      );
    }

    const newUser = await this.repository.createNew(dto);

    // Send verification email

    // Send response
    res.send({
      message: 'Account created. Confirmation email sent to specified email',
      userdata: newUser,
    });
  }

  /**
   * The function updates the user data
   * to the data passed to the DTO
   * @param dto
   * @returns
   */
  public async updateUser(dto: object) {
    try {
      //
    } catch (err) {
      this.logger.error(
        `An error occurred while updating the user: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * The function deletes the user
   * and all data associated with it
   * @param dto
   * @returns
   */
  public async deleteUser(dto: object) {
    try {
      //
    } catch (err) {
      this.logger.error(
        `An error occurred while deleting the user: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * Account login function
   * @param dto
   * @returns
   */
  public async login(dto: object) {
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
  public async logout() {
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
  public async resetPassword(dto: object) {
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
  public async setTwoFactorAuth(dto: object) {
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
