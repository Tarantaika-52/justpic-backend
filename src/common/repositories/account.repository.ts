import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/shared';
import { User } from 'prisma/__generated__';
import { RegisterUserDto } from '../dto/user/register.dto';

/**
 * Repository for interacting with account entities
 */
@Injectable()
export class AccountRepository {
  private readonly logger: Logger;

  public constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(AccountRepository.name);
  }

  /**
   * Search for an account by unique identifier.
   * @param id - unique account identifier
   * @returns funded account or null
   */
  public async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          uid: id,
        },
        include: {
          interests: true,
        },
      });

      return user;
    } catch (err) {
      this.logger.error(`⚠️ Unable to find user in database\n${err.stack}`);
      throw new InternalServerErrorException('Unable to find user in database');
    }
  }

  /**
   * Search for an account by email.
   * @param email - account email
   * @returns funded account or null
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      return user;
    } catch (err) {
      this.logger.error(`⚠️ Unable to find user in database: ${err.message}`);
      throw new InternalServerErrorException('Unable to find user in database');
    }
  }

  /**
   * The function checks the existence of an account
   * by email address
   * @param email - user email
   */
  public async isEmailAlreadyTaken(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: {
          email: email,
        },
      });
      return count > 0;
    } catch (err) {
      this.logger.error(`⚠️ Unable to check user exist: ${err.message}`);
      throw new InternalServerErrorException('Unable to check user exist');
    }
  }

  /**
   * Creates a new account with data from DTO
   * @param dto - account creation details
   * @returns new account
   */
  public async createNew(dto: RegisterUserDto): Promise<User> {
    try {
      const { username, email, password } = dto;

      const newUser = await this.prisma.user.create({
        data: {
          username: username,
          email: email,
          password: password,
          profile: {
            create: {},
          },
          interests: {
            create: {},
          },
        },
      });

      return newUser;
    } catch (err) {
      this.logger.error(`⚠️ Failed to create new user: ${err.message}`);
      throw new InternalServerErrorException('Failed to create new user');
    }
  }

  public async updateAccountData(dto: object) {
    //
  }

  public async deleteAccount(uid: string): Promise<void> {
    try {
      const deleteTransaction = this.prisma.$transaction([
        this.prisma.userInterests.delete({
          where: {
            uid,
          },
        }),
        this.prisma.profile.delete({
          where: {
            uid,
          },
        }),
        this.prisma.user.delete({
          where: {
            uid,
          },
        }),
      ]);

      await deleteTransaction;
    } catch (err) {
      this.logger.error(`⚠️ Failed to delete user: ${err.message}`);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
