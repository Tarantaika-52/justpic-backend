import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RegisterUserDTO } from 'src/common/dto/user/register-user.dto';

@Injectable()
export class AccountService {
  private readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(AccountService.name);
  }

  public async createNewUser(dto: RegisterUserDTO, clientIP: string) {
    const { username, email, password } = dto;
    this.logger.log(
      `Registering an account via email: ${email}; IP: ${clientIP}`,
    );

    const isEmailTaken = await this.isEmailAlreadyTaken(email);
    if (isEmailTaken) {
      this.logger.log(
        'Failed to register an account: Email is not available for registration',
      );
      throw new InternalServerErrorException(
        'Email is not available for registration',
      );
    }

    //Creating account via repo

    // Sending verification mail

    return {};
  }

  private async isEmailAlreadyTaken(email: string): Promise<boolean> {
    if (!email) throw new Error('Email is missing');

    //...

    return false;
  }
}
