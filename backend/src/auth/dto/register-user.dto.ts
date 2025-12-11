import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AgeGroup } from '../../enums/age-group.enum';

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  nickname: string;

  @IsEnum(AgeGroup)
  ageGroup: AgeGroup;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}