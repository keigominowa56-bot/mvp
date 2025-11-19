import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityFundsService } from './activity-funds.service';
import { ActivityFundsController } from './activity-funds.controller';
import { ActivityFund } from '../../entities/activity-fund.entity';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityFund]), MembersModule],
  providers: [ActivityFundsService],
  controllers: [ActivityFundsController],
  exports: [ActivityFundsService],
})
export class ActivityFundsModule {}
