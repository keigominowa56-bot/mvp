import { IsOptional, IsString } from 'class-validator';

export class SearchPoliticiansDto {
  @IsOptional()
  @IsString()
  region?: string; // regionId もしくは名前での検索を想定（本実装で確定）

  @IsOptional()
  @IsString()
  party?: string; // partyId もしくは名前

  @IsOptional()
  @IsString()
  q?: string; // キーワード（名前/プロフィール）
}