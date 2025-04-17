import { Injectable } from '@nestjs/common';
import { IBaseRepository } from '../interfaces';
import { Prisma, Profile } from 'prisma/__generated__';
import { PrismaService } from 'src/infra/prisma/prisma.service';

type FindArgs = Prisma.ProfileFindFirstArgs;

@Injectable()
export class ProfileRepository
  implements IBaseRepository<Profile, FindArgs, undefined>
{
  public constructor(private readonly prisma: PrismaService) {}

  public async findFirst(params: FindArgs): Promise<Profile | null> {
    return;
  }

  public async findUnique(param: FindArgs): Promise<Profile | null> {
    const { where, select } = param as Prisma.ProfileFindUniqueArgs;
    const profile = await this.prisma.profile.findUnique({
      where,
      select,
    });

    return profile;
  }
}
