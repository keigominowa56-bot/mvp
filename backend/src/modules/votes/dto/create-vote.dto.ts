import { IsEnum } from 'class-validator';
import { VoteChoice } from 'src/enums/vote-choice.enum';

export class CreateVoteDto {
  @IsEnum(VoteChoice)
  choice: VoteChoice;
}