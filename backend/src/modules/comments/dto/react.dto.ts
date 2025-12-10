import { IsIn, IsString } from 'class-validator';

export class ReactDto {
  @IsString()
  @IsIn(['agree'])
  type: 'agree';
}