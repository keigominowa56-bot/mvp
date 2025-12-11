import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticiansService } from './politicians.service';
import { PoliticiansController } from './politicians.controller';
import { PoliticianProfile, FundingSpendingItem } from '../../entities/politician-profile.entity';
import { User } from '../../entities/user.entity';
import { Party } from '../../entities/party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PoliticianProfile, FundingSpendingItem, User, Party])],
  controllers: [PoliticiansController],
  providers: [PoliticiansService],
  exports: [PoliticiansService],
})
export class PoliticiansModule {}