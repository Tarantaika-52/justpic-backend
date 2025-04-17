import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Prisma, Profile } from 'prisma/__generated__';
import { ProfileRepository } from 'src/common/repositories/profile.repository';
import { RedisService } from 'src/infra/redis/redis.service';

/**
 * Сервис для работы с логикой профилей
 */
@Injectable()
export class ProfileService {
  private readonly logger: Logger;

  /**
   * Конструктор класса
   * @param repo - репозиторий для работой с сущностью профиля
   */
  public constructor(
    private readonly repo: ProfileRepository,
    private readonly redis: RedisService,
  ) {
    this.logger = new Logger(ProfileService.name);
  }

  /**
   * Метод получает профиль через сессию авторизованного пользователя
   * @param req - объект запроса
   */
  public async findProfileFromSession(req: FastifyRequest) {
    const session = req.session.userSession;

    if (!session) {
      throw new BadRequestException('Invalid session');
    }

    const where: Prisma.ProfileWhereInput = { id: session.user.id };
    const profile = await this.getProfileOrThrow(where);

    return this.toPublicProfile(profile);
  }

  /**
   * Метод находит и возвращает профиль по имени пользователя
   * @param username - имя пользователя
   */
  public async findProfileByUsername(username: string, req: FastifyRequest) {
    const where: Prisma.ProfileWhereInput = { username };
    const key = `cache:p:${username}`;
    const profile: Profile = await this.redis.wrapInCache(
      key,
      300,
      async () => {
        return await this.getProfileOrThrow(where);
      },
    );

    return await this.checkProfileVisibility(profile, req);
  }

  /**
   * Метод проверяет возможность просматривать профиль в зависимости
   * от настроек профиля
   * @param profile
   * @param req
   */
  private async checkProfileVisibility(profile: Profile, req: FastifyRequest) {
    const { username, avatarUrl, avatarPreviewUrl, isPublic } = profile;
    const { session } = req;

    if (!isPublic) {
      if (!session.userSession) {
        return { username: profile.username };
      }
      if (session.userSession.user.id != profile.id) {
        return { username, avatarUrl, avatarPreviewUrl };
      }
    }

    return this.toPublicProfile(profile);
  }

  /**
   * Метод получает и возвращает профиль, исключив все чувствительные данные
   * @param where - параметры для поиска профиля
   */
  private toPublicProfile(profile: Profile) {
    const { id, ...publicProfile } = profile;
    return publicProfile;
  }

  /**
   * Найти профиль по заданным параметрам или выбросить исключение
   * @param where - параметры для поиска
   */
  private async getProfileOrThrow(
    where: Prisma.ProfileWhereInput,
    select?: Prisma.ProfileSelect,
  ) {
    let profile: Profile;
    try {
      profile = await this.repo.findUnique({
        where,
        select,
      });
    } catch (err) {
      this.logger.error('Failed to fetch profile from repository', err);
      throw new InternalServerErrorException(
        `Failed to get profile by ${JSON.stringify(where)}`,
      );
    }

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
