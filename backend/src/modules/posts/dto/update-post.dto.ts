import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(['policy', 'activity'])
  postCategory?: 'policy' | 'activity';

  @IsOptional()
  @IsIn(['public', 'hidden'])
  visibility?: 'public' | 'hidden';

  @IsOptional()
  @IsString()
  regionPref?: string;

  @IsOptional()
  @IsString()
  regionCity?: string;
}