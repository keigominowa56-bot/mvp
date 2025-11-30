import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { Post } from '../posts/post.entity';
import { Vote } from '../votes/vote.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Vote, User])],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}