import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLike } from '../../entities/comment-like.entity';
import { Comment } from '../comments/comment.entity';

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectRepository(CommentLike) private readonly likeRepo: Repository<CommentLike>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
  ) {}

  async like(commentId: string, userId: string) {
    const c = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!c) throw new BadRequestException('comment not found');
    const exist = await this.likeRepo.findOne({ where: { commentId, userId } });
    if (exist) return exist;
    const l = this.likeRepo.create({ commentId, userId });
    return this.likeRepo.save(l);
  }

  async unlike(commentId: string, userId: string) {
    const exist = await this.likeRepo.findOne({ where: { commentId, userId } });
    if (!exist) return { deleted: false };
    await this.likeRepo.remove(exist);
    return { deleted: true };
  }

  async count(commentId: string) {
    return this.likeRepo.count({ where: { commentId } });
  }

  async isLiked(commentId: string, userId: string) {
    const exist = await this.likeRepo.findOne({ where: { commentId, userId } });
    return !!exist;
  }
}