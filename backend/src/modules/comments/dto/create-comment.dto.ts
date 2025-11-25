import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  body: string;

  @IsOptional()
  @IsArray()
  images?: string[];
}
