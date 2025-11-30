import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentLike } from '../../entities/comment-like.entity';
import { CommentLikesService } from './comment-likes.service';
import { CommentLikesController } from './comment-likes.controller';
import { Comment } from '../comments/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentLike, Comment])],
  providers: [CommentLikesService],
  controllers: [CommentLikesController],
  exports: [CommentLikesService],
})
export class CommentLikesModule {}