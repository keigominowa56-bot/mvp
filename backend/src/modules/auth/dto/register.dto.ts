import { IsEmail, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  // role は通常 'user' 固定（政治家は管理側で昇格）
  @IsOptional()
  @IsIn(['user'])
  role?: 'user';

  // KYC
  @IsString()
  name: string;

  @IsInt()
  @Min(18)
  age: number;

  @IsString()
  addressPref: string;

  @IsString()
  addressCity: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  governmentIdUrl?: string;
}