import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly _users: UsersService,
  ) {}

  async list(postId: string, _cursor?: string, limit = 20) {
    const qb = this.comments.createQueryBuilder('c')
      .where('c.postId = :postId', { postId })
      .leftJoinAndSelect('c.author', 'author')
      .orderBy('c.createdAt', 'ASC');

    qb.take(Math.min(limit, 100));
    return qb.getMany();
  }

  async create(postId: string, authorUserId: string, dto: CreateCommentDto) {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    // mentions: nickname 配列 → ユーザーID配列へ解決（UsersService 側に finder を用意している前提）
    let mentionIds: string[] | null = null;
    if (dto.mentions?.length) {
      const found = await Promise.all(dto.mentions.map((nick) => this.usersRepo.findOne({ where: { nickname: nick } })));
      mentionIds = found.filter(Boolean).map((u) => (u as User).id);
    }

    const comment = this.comments.create({
      postId,
      authorUserId,
      content: dto.content,
      mediaIds: dto.mediaIds ?? null,
      mentions: mentionIds,
    });
    const saved = await this.comments.save(comment);

    // ここで通知モジュールへイベント発火（メンション通知・返信通知など）は拡張ポイント
    // await this.notifications.emitMention(mentionIds, saved);

    return saved;
  }
}