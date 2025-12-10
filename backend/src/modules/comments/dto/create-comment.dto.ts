import { IsString, IsOptional, IsUUID } from 'class-validator';

// コメント作成API（POST /posts/:postId/comments）で使用
export class CreateCommentDto {
  @IsString()
  body: string;

  // メディアID（画像/動画のUUID）。任意で添付可能
  @IsUUID()
  @IsOptional()
  mediaId?: string;

  // メンションは別DTO/別機能で対応済みの前提（必要に応じて追加）
  // @IsArray()
  // @IsString({ each: true })
  // @IsOptional()
  // mentions?: string[];
}