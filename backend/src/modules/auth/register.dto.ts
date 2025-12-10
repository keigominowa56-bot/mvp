import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @Matches(/^[0-9+\-\s]{7,15}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  addressPrefecture?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  // ファイルは Multer 経由で受け取るためDTOには含めない（license, mynumber）
}