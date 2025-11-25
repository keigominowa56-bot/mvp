import { IsString, IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsString()
  targetType: string; // 'post' | 'comment'

  @IsNumber()
  targetId: number;

  @IsString()
  reason: string;
}