import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  async create(dto: CreateCommentDto, authorId?: string) {
    const c = this.repo.create({
      postId: dto.postId,
      content: dto.content,
      authorId,
    });
    return this.repo.save(c);
  }

  async findForPost(postId: string) {
    return this.repo.find({
      where: { postId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async remove(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Comment not found');
    await this.repo.remove(c);
    return { deleted: true };
  }
}