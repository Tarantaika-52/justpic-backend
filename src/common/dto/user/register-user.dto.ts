import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO для регистрации нового пользователя
 */
export class RegisterUserDTO {
  @IsString({ message: 'The username must be a string' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @MinLength(3, { message: 'Username is too short' })
  @MaxLength(42, { message: 'Username is too long' })
  public username: string;

  @IsString({ message: 'The email must be a string' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Incorrect email format' })
  @MaxLength(256, { message: 'Email is too long' })
  public email: string;

  @IsString({ message: 'The password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password is too short' })
  @MaxLength(128, { message: 'Password is too long' })
  @IsStrongPassword({}, { message: 'The password is not complex enough' })
  public password: string;
}
