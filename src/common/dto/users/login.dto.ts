import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO для входа в аккаунт
 */
export class LoginDto {
  @IsString({ message: 'The email must be a string' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Incorrect email format' })
  @MaxLength(256, { message: 'Email is too long' })
  email: string;

  @IsString({ message: 'The password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password is too short' })
  @MaxLength(128, { message: 'Password is too long' })
  password: string;
}
