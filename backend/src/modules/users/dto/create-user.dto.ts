import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;
  @IsString() nickname: string;
  @IsString() phone: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsOptional() regionId?: string;
}