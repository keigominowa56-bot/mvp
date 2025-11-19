import { PartialType } from '@nestjs/swagger';
import { CreateActivityFundDto } from './create-activity-fund.dto';

export class UpdateActivityFundDto extends PartialType(CreateActivityFundDto) {}
