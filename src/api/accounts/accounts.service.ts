import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { FastifyRequest } from 'fastify';
import { RegisterUserDTO } from 'src/common/dto/users/register-user.dto';
import { AccountRepository } from 'src/common/repositories/accounts.repository';
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

  /**
   * DEBUG ONLY!
   * NOT FOR PROD!
   */
  public async getAll() {
    const users = await this.repo.findMany({});
    return users;
  }

  public async getUserBySession(req: FastifyRequest) {
    const session = req.session.userSession;
    if (!session) {
      throw new ForbiddenException('Invalid session');
    }
    const user = await this.getById(session.id);
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
  public async createNewUser(dto: RegisterUserDTO) {
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

  public async createRegisterPending(dto: RegisterUserDTO, clientIP: string) {
    const { username, email, password: pass } = dto;
    const password = await hash(pass);
    const redisKey = `pending:register:${email}`;
    const data = {
      username,
      email,
      password,
      clientIP,
    };

    await this.redis.set(redisKey, JSON.stringify(data), 'EX', 3600);
  }

  /**
   * Получить пользователя по его ID
   * @param id
   * @returns
   */
  public async getById(id: string) {
    const redisKey = `cache:a:${id}`;
    const cached = await this.redis.get(redisKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.repo.findUnique({
      where: { id },
      select: {
        id: true,
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

  public async delete(id: string): Promise<void> {
    const redisKey = `cache:a:${id}`;
    await this.redis.del(redisKey);
    await this.repo.delete({ where: { id } });
  }
}
