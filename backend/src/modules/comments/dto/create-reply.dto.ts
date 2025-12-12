import { IsString, IsOptional } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

/**
 * CreateReplyDto: inherits CreateCommentDto, defines body (no override keyword)
 */
export class CreateReplyDto extends CreateCommentDto {
  @IsString()
  body: string;

  @IsOptional()
  mediaId?: string;
}