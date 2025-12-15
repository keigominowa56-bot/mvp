import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Politician } from 'src/entities/politician.entity';
import { PoliticiansService } from './politicians.service';
import { PoliticiansController } from './politicians.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Politician])],
  controllers: [PoliticiansController],
  providers: [PoliticiansService],
  exports: [PoliticiansService],
})
export class PoliticiansModule {}