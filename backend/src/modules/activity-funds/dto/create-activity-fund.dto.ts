import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityFundDto {
  @ApiProperty()
  amount!: number;

  @ApiProperty()
  description!: string;

  @ApiProperty({ required: false })
  fileId?: string;
}