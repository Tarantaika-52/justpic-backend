import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/user';

@Injectable()
export class AccountRepository {
  public async findById(id: string) {
    return;
  }

  public async createNew(dto: RegisterUserDto) {
    return;
  }
}
