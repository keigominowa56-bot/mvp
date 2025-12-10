import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { CommentMention } from '../../entities/comment-mention.entity';
import { CommentReaction } from '../../entities/comment-reaction.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
// CreateReplyDto は mediaId を持つように拡張済みである前提
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(CommentMention) private readonly mentionsRepo: Repository<CommentMention>,
    @InjectRepository(CommentReaction) private readonly reactionsRepo: Repository<CommentReaction>,
  ) {}

  async listByPost(postId: string) {
    return this.commentsRepo.find({
      where: { postId },
      order: { createdAt: 'ASC' },
      relations: ['reactions', 'mentions', 'parent', 'children'],
    });
  }

  async get(commentId: string) {
    const comment = await this.commentsRepo.findOne({
      where: { id: commentId },
      relations: ['reactions', 'mentions', 'parent', 'children'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async createComment(postId: string, authorId: string, dto: CreateCommentDto) {
    if (!postId) throw new BadRequestException('postId is required');

    const comment = await this.commentsRepo.save(
      this.commentsRepo.create({
        postId,
        authorId,
        body: dto.body,
        parentId: null,
        // メディアIDを保存（任意）
        mediaId: dto.mediaId ?? null,
      }),
    );

    // 既存のメンション処理／通知処理がある場合はここで呼び出し
    // await this.handleMentions(comment, authorId, dto.mentions);

    return this.get(comment.id);
  }

  async reply(commentId: string, authorId: string, dto: CreateReplyDto) {
    const parent = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!parent) throw new NotFoundException('Parent comment not found');

    const comment = await this.commentsRepo.save(
      this.commentsRepo.create({
        postId: parent.postId,
        parentId: parent.id,
        authorId,
        body: dto.body,
        // 返信側でもメディアIDを保存（任意）
        // CreateReplyDto に mediaId?: string が含まれている前提
        mediaId: (dto as any).mediaId ?? null,
      }),
    );

    // 親コメント作者への通知／メンション処理があれば既存ロジックを呼び出し
    // if (parent.authorId !== authorId) { ... }
    // await this.handleMentions(comment, authorId, dto.mentions);

    return this.get(comment.id);
  }

  async react(commentId: string, userId: string, dto: { type: 'agree' }) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (dto.type !== 'agree') {
      throw new BadRequestException('Unsupported reaction type');
    }

    try {
      await this.reactionsRepo.save(
        this.reactionsRepo.create({
          commentId,
          userId,
          type: dto.type,
        }),
      );
    } catch (e) {
      // UNIQUE違反時は無視
    }

    return this.get(commentId);
  }

  async unreact(commentId: string, userId: string, dto: { type: 'agree' }) {
    await this.reactionsRepo.delete({ commentId, userId, type: dto.type });
    return this.get(commentId);
  }

  // 既存のメンション処理がある場合はここに実装
  // private async handleMentions(comment: Comment, authorId: string, mentions?: string[]) { ... }
}