import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { FastifyRequest } from 'fastify';
import { RegisterUserDTO } from 'src/common/dto/users/register-user.dto';
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
    const user = await this.getByIdOrThrow(session.user.id);
    if (!user) {
      throw new NotFoundException('The session does not contain a user');
    }
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

    const newUser = await this.repo.create({
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

    this.logger.log(`A new user with the name: ${username} has been created`);

    return newUser;
  }

  public async createRegistrationPending(dto: RegisterUserDTO) {
    const { username, email, password: pass } = dto;

    const isEmailTaken = await this.isEmailAlreadyTaken(email);
    if (isEmailTaken) {
      throw new BadRequestException('Email is not available for registration');
    }

    const password = await hash(pass);
    const redisKey = getRegisterPendingKey(email);
    const data = {
      username,
      email,
      password,
    };

    await this.redis.set(redisKey, JSON.stringify(data), 'EX', 86400);
  }

  /**
   * Получить пользователя по его ID
   * @param id
   * @returns
   */
  public async getByIdOrThrow(id: string) {
    const redisKey: string = getAccountCacheKey(id);
    const cached = await this.redis.get(redisKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.repo.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        region: true,
        isMetricsAllowed: true,
        isNsfwAllowed: true,
        isAdvertsAllowed: true,
        isAiTrainAllowed: true,
      },
    });

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
    const count: number = await this.repo.count({ where: { email } });
    const isTaken: boolean = count > 0;

    return isTaken;
  }
}
