import { IsString, IsIn } from 'class-validator';

export class CreateVoteDto {
  @IsString()
  postId: string;

  @IsString()
  @IsIn(['support', 'oppose'])
  type: 'support' | 'oppose';
}