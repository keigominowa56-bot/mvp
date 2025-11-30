import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Post } from '../posts/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Post])],
  providers: [VotesService],
  controllers: [VotesController],
  exports: [VotesService],
})
export class VotesModule {}