import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../../entities/report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AdminReportsController } from './admin-reports.controller';
import { User } from '../../entities/user.entity';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Post, Comment])],
  providers: [ReportsService],
  controllers: [ReportsController, AdminReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}