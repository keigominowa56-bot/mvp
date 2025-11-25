import { ApiProperty } from '../../../lib/swagger-fallback';
import { IsString, IsUUID, IsOptional, IsNumber, IsDateString, IsObject } from 'class-validator';

export class CreateActivityFundDto {
  @ApiProperty({
    description: 'Member ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  memberId: string;

  @ApiProperty({
    description: 'Fiscal year',
    example: 2024,
  })
  @IsNumber()
  fiscalYear: number;

  @ApiProperty({
    description: 'Expense category',
    example: '広報費',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 50000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Expense description',
    example: '議会報告書の印刷費',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Expense date',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiProperty({
    description: 'Recipient',
    example: '株式会社印刷所',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiProperty({
    description: 'Purpose',
    example: '議会活動の広報',
    required: false,
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { receiptNumber: 'R-2024-001', approvalDate: '2024-01-10' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
