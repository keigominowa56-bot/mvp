import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdatePoliticianDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  partyId?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;

  // pledges は簡易JSON配列として受け取り想定（型安全のためAPI契約で厳密化を推奨）
  @IsOptional()
  pledges?: Array<{ title: string; description?: string }>;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fundingReportUrl?: string;
}