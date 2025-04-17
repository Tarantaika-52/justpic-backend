import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { Account, Prisma } from 'prisma/__generated__';
import { IBaseRepository } from '../interfaces';

type FindArgs = Prisma.AccountFindFirstArgs;
type CreateArgs = Prisma.AccountCreateArgs;

@Injectable()
export class AccountRepository
  implements IBaseRepository<Account, FindArgs, CreateArgs>
{
  public constructor(private readonly prisma: PrismaService) {}

  public async findFirst(params: FindArgs): Promise<Account | null> {
    const { where, select } = params;
    const account = await this.prisma.account.findFirst({
      where,
      select,
    });

    return account;
  }

  public async findUnique(param: FindArgs): Promise<Account | null> {
    const { where, select } = param as Prisma.AccountFindUniqueArgs;
    const account = await this.prisma.account.findUnique({
      where,
      select,
    });

    return account;
  }

  public async findMany(param: FindArgs) {
    const { where, select } = param;
    const accounts = await this.prisma.account.findMany({
      where,
      select,
    });

    return accounts;
  }

  public async count(params: FindArgs): Promise<number> {
    const { where } = params;
    const count = await this.prisma.account.count({
      where,
    });

    return count;
  }

  public async create(params: CreateArgs): Promise<Account | null> {
    const { data } = params;
    const newUser = await this.prisma.account.create({
      data,
    });

    return newUser;
  }

  public async delete(params: FindArgs): Promise<void> {
    const { where } = params;
    const deleteTransaction = this.prisma.$transaction([
      this.prisma.profile.delete({
        where: { ...(where as Prisma.ProfileWhereUniqueInput) },
      }),
      this.prisma.account.delete({
        where: { ...(where as Prisma.AccountWhereUniqueInput) },
      }),
    ]);

    await deleteTransaction;
  }
}
