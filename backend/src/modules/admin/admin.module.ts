import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/comment.entity';
import { Vote } from '../../entities/vote.entity';
import { AdminController } from './admin.controller';
import { AdminPostsController } from './admin.posts.controller';
import { AdminPoliticiansController } from './admin.politicians.controller';
import { AdminBulkPostsController } from './admin.bulk-posts.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Comment, Vote]),
    NotificationsModule,
  ],
  controllers: [AdminController, AdminPostsController, AdminPoliticiansController, AdminBulkPostsController],
})
export class AdminModule {}