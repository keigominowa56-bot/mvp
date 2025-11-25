import { IsString, IsNumber } from 'class-validator';

export class ReactDto {
  @IsString()
  targetType: string;

  @IsNumber()
  targetId: number;

  @IsString()
  type: string;
}
