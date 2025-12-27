import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticalFund } from '../../entities/political-fund.entity';
import { PoliticalFundsController } from './political-funds.controller';
import { PoliticalFundsService } from './political-funds.service';

@Module({
  imports: [TypeOrmModule.forFeature([PoliticalFund])],
  controllers: [PoliticalFundsController],
  providers: [PoliticalFundsService],
  exports: [PoliticalFundsService],
})
export class PoliticalFundsModule {}

