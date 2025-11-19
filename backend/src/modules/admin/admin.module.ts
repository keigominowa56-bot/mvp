import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Member } from '../../entities/member.entity';
import { Pledge } from '../../entities/pledge.entity';
import { User } from '../../entities/user.entity';
import { ActivityLog } from '../../entities/activity-log.entity';
import { ActivityFund } from '../../entities/activity-fund.entity';
import { ExternalFeedsModule } from '../external-feeds/external-feeds.module';
import { ActivityFundsModule } from '../activity-funds/activity-funds.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Pledge, User, ActivityLog, ActivityFund]),
    ExternalFeedsModule,
    ActivityFundsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}