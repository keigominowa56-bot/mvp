import { IsEnum } from 'class-validator';
import { VoteChoice } from '../../../enums/vote-choice.enum';

export class CreateVoteDto {
  @IsEnum(VoteChoice)
  choice: VoteChoice;
}