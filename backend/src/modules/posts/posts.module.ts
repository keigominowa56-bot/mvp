import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { Region } from '../../entities/region.entity';
import { Vote } from '../../entities/vote.entity';
import { Comment } from '../../entities/comment.entity';
import { PostsDebugController } from './posts-debug.controller';
import { PoliticianProfileExtended } from '../../entities/politician-profile-extended.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Region, Vote, Comment, PoliticianProfileExtended])],
  controllers: [PostsController, PostsDebugController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}