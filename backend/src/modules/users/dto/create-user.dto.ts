import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Firebase UID',
    example: 'firebase-uid-123',
  })
  @IsString()
  firebaseUid: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'admin'],
    default: 'user',
    required: false,
  })
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';

  @ApiProperty({
    description: 'User district',
    example: 'Tokyo',
    required: false,
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'Whether user is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
