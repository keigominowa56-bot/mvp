import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Post } from '../posts/post.entity';
import { AdminController } from './admin.controller';
import { AdminPostsController } from './admin.posts.controller';
import { AdminPoliticiansController } from './admin.politicians.controller';
import { AdminBulkPostsController } from './admin.bulk-posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post])],
  controllers: [AdminController, AdminPostsController, AdminPoliticiansController, AdminBulkPostsController],
})
export class AdminModule {}