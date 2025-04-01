import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterUserDto } from 'src/common/dto/user/register.dto';
import { AccountRepository } from 'src/common/repositories';

@Injectable()
export class UserService {
  private readonly logger: Logger;

  /**
   * Class constructor
   */
  public constructor(private readonly repository: AccountRepository) {
    this.logger = new Logger(UserService.name);
  }

  /**
   * The function returns the user by ID
   * or throws an exception
   * @param id - user id
   */
  public async getByIdOrThrow(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * The function finds and returns the user
   * by email address
   * @param email - user email
   */
  public async getByEmail(email: string) {
    try {
      const user = await this.repository.findByEmail(email);
      return user;
    } catch (err) {
      this.logger.error(`Error getting user by email: ${err.stack}`);
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
    const isUserExist: boolean = await this.repository.isEmailAlreadyTaken(
      dto.email,
    );

    if (isUserExist) {
      throw new InternalServerErrorException(
        'Email is not available for registration',
      );
    }

    const hashedPassword = await hash(dto.password);
    const data: RegisterUserDto = {
      ...dto,
      password: hashedPassword,
    };

    const newUser = await this.repository.createNew(data);

    await res.send({
      message: 'Account created. Confirmation email sent to specified email',
      userID: newUser.uid,
    });
  }

  /**
   * The function updates the user data
   * to the data passed to the DTO
   * @param dto
   * @returns
   */
  public async updateUser(dto: object, req: FastifyRequest, res: FastifyReply) {
    try {
      const updatedUser = await this.repository.updateAccountData(dto);

      return updatedUser;
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
   * @param id
   * @returns
   */
  public async deleteUser(
    dto: object,
    id: string,
    req: FastifyRequest,
    res: FastifyReply,
  ) {
    try {
      await res.send({
        message:
          'Account has been deleted. You have 30 days to restore your account',
      });
    } catch (err) {
      this.logger.error(
        `An error occurred while deleting the user: ${err.stack}`,
      );
      throw new InternalServerErrorException(`${err.stack}`);
    }
  }

  /**
   * This function is strictly for debugging!!!
   * The function deletes the user without confirmation and authorization
   * @param id
   */
  public async forceDeleteUser(
    id: string,
    req: FastifyRequest,
    res: FastifyReply,
  ) {
    await this.getByIdOrThrow(id);

    await this.repository.deleteAccount(id);
    await res.send({
      message: 'Deleted',
    });
  }
}
