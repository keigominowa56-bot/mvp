import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostType } from '../../../enums/post-type.enum';

export class QueryPostsDto {
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}