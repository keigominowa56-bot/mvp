// backend/src/modules/votes/dto/create-vote.dto.ts

import { IsNotEmpty, IsUUID, IsIn, IsOptional } from 'class-validator';

export class CreateVoteDto {
  @IsUUID()
  @IsNotEmpty()
  pledgeId: string;

  // 🚨 修正: コントローラで req.user.sub から値が代入されることを想定し、
  // DTOに userId を含める。IsOptionalにしてコントローラで設定されることを許可。
  @IsOptional() 
  @IsUUID()
  userId?: string; 
  
  // Member IDも引き続き保持
  @IsUUID()
  @IsNotEmpty()
  memberId: string; 

  @IsIn(['support', 'oppose'])
  @IsNotEmpty()
  voteType: 'support' | 'oppose';
}