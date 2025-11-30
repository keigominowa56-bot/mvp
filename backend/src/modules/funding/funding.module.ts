import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundingRecord } from '../../entities/funding-record.entity';
import { FundingService } from './funding.service';
import { FundingController } from './funding.controller';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundingRecord, User])],
  providers: [FundingService],
  controllers: [FundingController],
  exports: [FundingService],
})
export class FundingModule {}