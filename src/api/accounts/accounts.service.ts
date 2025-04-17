import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { FastifyRequest } from 'fastify';
import { Account, Prisma } from 'prisma/__generated__';
import { RegisterUserDTO } from 'src/common/dto/users/register-user.dto';
import { IRegistrationPending } from 'src/common/interfaces';
import { AccountRepository } from 'src/common/repositories/accounts.repository';
import { getAccountCacheKey, getRegisterPendingKey } from 'src/common/utils';
import { RedisService } from 'src/infra/redis/redis.service';

@Injectable()
export class AccountsService {
  private readonly logger: Logger;

  public constructor(
    private readonly repo: AccountRepository,
    private readonly redis: RedisService,
  ) {
    this.logger = new Logger(AccountsService.name);
  }

  public async getUserBySession(req: FastifyRequest) {
    const session = req.session.userSession;
    let user = await this.getByIdOrThrow(session.user.id);
    if (!user) {
      throw new NotFoundException('The session does not contain a user');
    }
    user.id = undefined;
    return user;
  }

  /**
   * Создание нового пользователя
   * @param dto
   * @param clientIP
   * @returns
   */
  public async allowRegistrationPending(dto: RegisterUserDTO) {
    const { email, username, password } = dto;

    const isEmailTaken = await this.isEmailAlreadyTaken(dto.email);
    if (isEmailTaken) {
      throw new BadRequestException('Email is not available for registration');
    }

    let user: Account;
    try {
      user = await this.repo.create({
        data: {
          email,
          password,
          profile: {
            create: {
              username,
            },
          },
        },
      });
    } catch (err) {
      this.logger.error('Could not create account', err);
      throw new InternalServerErrorException('Failed to create an account');
    }

    this.logger.log(`A new user with the name: ${username} has been created`);
    return user;
  }

  public async createRegistrationPending(dto: RegisterUserDTO) {
    const { username, email, password: pass } = dto;

    const isEmailTaken = await this.isEmailAlreadyTaken(email);
    if (isEmailTaken) {
      throw new BadRequestException('Email is not available for registration');
    }

    const password = await hash(pass);
    const redisKey = getRegisterPendingKey(email);
    const data: IRegistrationPending = {
      username,
      email,
      password,
      key: redisKey,
    };

    await this.redis.set(redisKey, JSON.stringify(data), 'EX', 86400);
  }

  /**
   * Получить пользователя по его ID
   * @param id
   * @returns
   */
  public async getByIdOrThrow(id: string): Promise<Account> {
    const redisKey: string = getAccountCacheKey(id);
    const cached = await this.redis.get(redisKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let user: Account | null;
    const select: Prisma.AccountSelect = {
      id: true,
      email: true,
      region: true,
      isMetricsAllowed: true,
      isNsfwAllowed: true,
      isAdvertsAllowed: true,
      isAiTrainAllowed: true,
    };
    const where: Prisma.AccountWhereInput = { id };

    try {
      user = await this.repo.findUnique({
        where,
        select,
      });
    } catch (err) {
      this.logger.error('', err);
      throw new InternalServerErrorException('Failed to get account by ID');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redis.set(redisKey, JSON.stringify(user), 'EX', 300);

    return user;
  }

  /**
   * Проверка существования аккаунта с указанным адресом электронной почты
   * @param email
   * @returns
   */
  private async isEmailAlreadyTaken(email: string): Promise<boolean> {
    let count: number;
    try {
      count = await this.repo.count({ where: { email } });
    } catch (err) {
      this.logger.error('', err);
      throw new InternalServerErrorException('');
    }

    const isTaken: boolean = count > 0;
    return isTaken;
  }
}
