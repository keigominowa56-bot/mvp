import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSearchController } from './admin-search.controller';
import { Post } from '../posts/post.entity';
import { Notification } from '../../entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Notification])],
  controllers: [AdminSearchController],
})
export class AdminSearchModule {}