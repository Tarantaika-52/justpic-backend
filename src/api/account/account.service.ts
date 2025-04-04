import { Injectable } from '@nestjs/common';
import { RegisterUserDTO } from 'src/common/dto/user/register-user.dto';

@Injectable()
export class AccountService {
  public async createNewUser(dto: RegisterUserDTO) {
    //
  }
}
