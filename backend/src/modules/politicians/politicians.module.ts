import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticianProfileController } from './politician-profile.controller';
import { User } from '../../entities/user.entity';
import { Follow } from '../follows/follow.entity';
import { Post } from '../posts/post.entity';
import { Policy } from '../../entities/policy.entity';
import { FundingRecord } from '../../entities/funding-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Post, Policy, FundingRecord])],
  controllers: [PoliticianProfileController],
})
export class PoliticiansModule {}