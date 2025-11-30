import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledPost } from '../../entities/scheduled-post.entity';
import { ScheduledPostsService } from './scheduled-posts.service';
import { ScheduledPostsController } from './scheduled-posts.controller';
import { User } from '../../entities/user.entity';
import { Post } from '../posts/post.entity';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledPost, User, Post]), ModerationModule],
  providers: [ScheduledPostsService],
  controllers: [ScheduledPostsController],
  exports: [ScheduledPostsService],
})
export class ScheduledPostsModule {}