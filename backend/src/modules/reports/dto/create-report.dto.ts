import { IsString, IsIn } from 'class-validator';

export class CreateReportDto {
  @IsString()
  targetId: string;

  @IsString()
  @IsIn(['comment', 'post', 'other'])
  targetType: 'comment' | 'post' | 'other';

  @IsString()
  reason: string;
}