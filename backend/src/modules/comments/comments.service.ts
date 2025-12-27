import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from 'src/enums/notification-type.enum';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  // listByPost -> list
  async list(postId: string, _cursor?: string, limit = 20) {
    const comments = await this.commentsRepo.find({
      where: { postId, parentId: IsNull() } as FindOptionsWhere<Comment>, // 親コメントのみ取得
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['reactions', 'author', 'post', 'children', 'children.author'],
    });
    
    // author情報が正しく取得されているか確認し、name, username, profileImageUrlを確実に含める
    // authorが取得できていない場合、authorUserIdから直接取得
    const commentsWithAuthors = await Promise.all(comments.map(async (comment: any) => {
      // 親コメントのauthor情報を確認・補完
      if (!comment.author && comment.authorUserId) {
        const user = await this.usersRepo.findOne({
          where: { id: comment.authorUserId },
          select: ['id', 'name', 'username', 'profileImageUrl', 'role'],
        });
        if (user) {
          comment.author = user;
          console.log(`[CommentsService] authorUserIdからUser取得: id=${user.id}, name=${user.name}, username=${user.username}`);
        }
      } else if (comment.author) {
        // authorが取得できている場合でも、name, username, profileImageUrlを確実に含める
        const user = await this.usersRepo.findOne({
          where: { id: comment.author.id },
          select: ['id', 'name', 'username', 'profileImageUrl', 'role'],
        });
        if (user) {
          comment.author = {
            ...comment.author,
            name: user.name || comment.author.name || null,
            username: user.username || comment.author.username || null,
            profileImageUrl: user.profileImageUrl || comment.author.profileImageUrl || null,
          };
        }
      }
      
      // 子コメントのauthor情報も確認・補完
      if (comment.children && comment.children.length > 0) {
        comment.children = await Promise.all(comment.children.map(async (child: any) => {
          if (!child.author && child.authorUserId) {
            const user = await this.usersRepo.findOne({
              where: { id: child.authorUserId },
              select: ['id', 'name', 'username', 'profileImageUrl', 'role'],
            });
            if (user) {
              child.author = user;
            }
          } else if (child.author) {
            const user = await this.usersRepo.findOne({
              where: { id: child.author.id },
              select: ['id', 'name', 'username', 'profileImageUrl', 'role'],
            });
            if (user) {
              child.author = {
                ...child.author,
                name: user.name || child.author.name || null,
                username: user.username || child.author.username || null,
                profileImageUrl: user.profileImageUrl || child.author.profileImageUrl || null,
              };
            }
          }
          return child;
        }));
      }
      
      return comment;
    }));
    
    return commentsWithAuthors;
  }

  // createComment -> create
  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.postsRepo.findOne({ where: { id: postId }, relations: ['author'] });
    if (!post) {
      throw new Error('Post not found');
    }

    const c = this.commentsRepo.create({
      postId,
      authorUserId: authorId,
      content: dto.content,
      parentId: dto.parentId || null,
    } as any);
    const savedComment = await this.commentsRepo.save(c) as unknown as Comment;

    // 通知を作成
    // 投稿の作成者に通知（自分自身へのコメントは除外）
    if (post.authorUserId && post.authorUserId !== authorId) {
      const author = await this.usersRepo.findOne({ where: { id: post.authorUserId } });
      if (author) {
        const commentAuthor = await this.usersRepo.findOne({ where: { id: authorId } });
        const authorName = commentAuthor?.name || 'ユーザー';
        await this.notificationsService.create(
          post.authorUserId,
          NotificationType.COMMENT,
          '新しいコメント',
          `${authorName}さんが「${post.title}」にコメントしました`,
          {
            postId: postId,
            commentId: savedComment.id,
            commentContent: dto.content,
          },
        );
      }
    }

    // 親コメントの作成者に通知（返信の場合）
    if (dto.parentId) {
      const parentComment = await this.commentsRepo.findOne({
        where: { id: dto.parentId },
        relations: ['author'],
      });
      if (parentComment && parentComment.authorUserId !== authorId) {
        const commentAuthor = await this.usersRepo.findOne({ where: { id: authorId } });
        const authorName = commentAuthor?.name || 'ユーザー';
        await this.notificationsService.create(
          parentComment.authorUserId,
          NotificationType.COMMENT,
          'コメントへの返信',
          `${authorName}さんがあなたのコメントに返信しました`,
          {
            postId: postId,
            commentId: savedComment.id,
            commentContent: dto.content,
          },
        );
      }
    }

    return savedComment;
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.authorUserId !== userId) {
      throw new Error('You can only delete your own comments');
    }
    await this.commentsRepo.delete(commentId);
    return { ok: true };
  }
}