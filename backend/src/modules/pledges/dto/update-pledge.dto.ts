import { PartialType } from '@nestjs/swagger';
import { CreatePledgeDto } from './create-pledge.dto';

export class UpdatePledgeDto extends PartialType(CreatePledgeDto) {}
