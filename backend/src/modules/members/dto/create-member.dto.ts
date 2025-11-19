import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({
    description: 'Member name',
    example: '田中太郎',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'tanaka@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Member photo URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({
    description: 'Member affiliation',
    example: '東京都議会',
  })
  @IsString()
  affiliation: string;

  @ApiProperty({
    description: 'Member biography',
    example: '政治家として20年の経験を持つ...',
    required: false,
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({
    description: 'Member position',
    example: '議員',
    required: false,
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({
    description: 'Member district',
    example: '渋谷区',
    required: false,
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'Member party',
    example: '自由民主党',
    required: false,
  })
  @IsOptional()
  @IsString()
  party?: string;

  @ApiProperty({
    description: 'Member website',
    example: 'https://tanaka.example.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Twitter handle',
    example: 'tanaka_taro',
    required: false,
  })
  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @ApiProperty({
    description: 'Blog RSS URL',
    example: 'https://tanaka.example.com/feed.xml',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  blogRssUrl?: string;

  @ApiProperty({
    description: 'Official RSS URL',
    example: 'https://assembly.example.com/rss.xml',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  officialRssUrl?: string;

  @ApiProperty({
    description: 'Whether member is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
