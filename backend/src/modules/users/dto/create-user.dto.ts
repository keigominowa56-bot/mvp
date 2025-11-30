import { IsEmail, IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsIn(['user', 'politician', 'admin'])
  role?: 'user' | 'politician' | 'admin';

  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() @Min(18) age?: number;
  @IsOptional() @IsString() addressPref?: string;
  @IsOptional() @IsString() addressCity?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() governmentIdUrl?: string;
}