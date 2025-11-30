import { IsEmail, IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() password?: string;

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