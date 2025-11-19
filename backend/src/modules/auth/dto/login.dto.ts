import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyNzQ4...',
  })
  @IsString()
  @IsNotEmpty()
  firebaseToken: string;
}
