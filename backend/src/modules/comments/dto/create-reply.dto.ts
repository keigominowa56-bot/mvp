import { IsString } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

// 返信作成APIでも mediaId を利用可能にするため、CreateCommentDto を継承
export class CreateReplyDto extends CreateCommentDto {
  @IsString()
  override body: string;
}