// backend/src/modules/activity-logs/dto/create-activity-log.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ActivityLogType } from '../../../enums/activity-log-type.enum.js'; // 修正: .js拡張子を追加

export class CreateActivityLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ enum: ActivityLogType })
  @IsEnum(ActivityLogType)
  @IsNotEmpty()
  source: ActivityLogType; // 修正: typeではなくsourceとして定義

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}