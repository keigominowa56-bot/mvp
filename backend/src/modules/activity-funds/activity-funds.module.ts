import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityFund } from '../../entities/activity-fund.entity';
import { ActivityFundsService } from './activity-funds.service';
import { ActivityFundsController } from './activity-funds.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityFund])],
  providers: [ActivityFundsService],
  controllers: [ActivityFundsController],
  exports: [ActivityFundsService],
})
export class ActivityFundsModule {}