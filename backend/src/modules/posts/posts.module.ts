import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { User } from '../../entities/user.entity';

// NgWordsService を提供するモジュール（exports: [NgWordsService] 必須）
import { ModerationModule } from '../moderation/moderation.module';

// ActivityLogService を提供するモジュール（exports: [ActivityLogService] 必須）
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User]),
    ModerationModule,       // ← 追加: NgWordsService の注入元
    ActivityLogsModule,     // ← 追加: ActivityLogService の注入元
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}