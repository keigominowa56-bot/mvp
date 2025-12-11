import { IsString } from 'class-validator';

export class LoginDto {
  // email or phone を許可
  @IsString()
  id: string;

  @IsString()
  password: string;
}