import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PledgesService } from './pledges.service';
import { PledgesController } from './pledges.controller';
import { Pledge } from '../../entities/pledge.entity';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pledge]), MembersModule],
  providers: [PledgesService],
  controllers: [PledgesController],
  exports: [PledgesService],
})
export class PledgesModule {}
