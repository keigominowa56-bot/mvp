import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';

export class CreatePledgeDto {
  @ApiProperty({
    description: 'Member ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({
    description: 'Pledge title',
    example: '地域の防災対策強化',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Pledge description',
    example: '地域の防災体制を強化し、住民の安全を確保するための具体的な施策を実施します。',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Pledge category',
    example: '防災・安全',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Target completion date',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiProperty({
    description: 'Pledge status',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}
