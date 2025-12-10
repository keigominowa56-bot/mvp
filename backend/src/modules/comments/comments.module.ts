import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from '../../entities/comment.entity';
import { CommentMention } from '../../entities/comment-mention.entity';
import { CommentReaction } from '../../entities/comment-reaction.entity';

// 依存モジュールを追加
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentMention, CommentReaction]),
    // ⬇️ ここに依存モジュールを追加してください
    UsersModule,
    NotificationsModule,
    PostsModule,
    // ⬆️ ここに依存モジュールを追加してください
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  // 他モジュールから CommentsService を利用可能にする
  exports: [CommentsService],
})
export class CommentsModule {}