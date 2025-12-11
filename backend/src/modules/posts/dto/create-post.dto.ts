import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostType } from '../../../enums/post-type.enum';

export class CreatePostDto {
  @IsEnum(PostType)
  type: PostType;

  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  mediaIds?: string[];

  @IsOptional()
  @IsString()
  regionId?: string;
}