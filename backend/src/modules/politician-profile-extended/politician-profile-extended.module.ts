import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticianProfileExtended } from '../../entities/politician-profile-extended.entity';
import { PoliticianProfileExtendedController } from './politician-profile-extended.controller';
import { PoliticianProfileExtendedService } from './politician-profile-extended.service';

@Module({
  imports: [TypeOrmModule.forFeature([PoliticianProfileExtended])],
  controllers: [PoliticianProfileExtendedController],
  providers: [PoliticianProfileExtendedService],
  exports: [PoliticianProfileExtendedService],
})
export class PoliticianProfileExtendedModule {}

