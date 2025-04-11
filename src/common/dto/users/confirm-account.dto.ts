import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmAccountDTO {
  @IsString()
  @IsNotEmpty()
  @Length(6)
  code: string;
}
