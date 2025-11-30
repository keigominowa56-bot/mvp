import { IsString, IsIn } from 'class-validator';

export class ModActionDto {
  @IsString()
  reportId: string;

  @IsString()
  @IsIn(['accept', 'reject'])
  action: 'accept' | 'reject';
}