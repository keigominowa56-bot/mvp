import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  mediaIds?: string[];

  // フロントで @nickname を解析して渡すか、サーバー側で解析するかは実装次第
  @IsOptional()
  @IsArray()
  mentions?: string[]; // nickname の配列（サーバー側でユーザーIDに解決）

  @IsOptional()
  @IsUUID()
  parentId?: string | null; // 親コメントのID
}