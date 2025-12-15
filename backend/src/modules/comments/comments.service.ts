import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>) {}

  // listByPost -> list
  async list(postId: string, _cursor?: string, limit = 20) {
    return this.commentsRepo.find({
      where: { postId } as FindOptionsWhere<Comment>,
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['reactions', 'mentions', 'parent', 'children'],
    });
  }

  // createComment -> create
  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    const c = this.commentsRepo.create({
      postId,
      authorUserId: authorId,
      content: dto.content,
      parentId: null,
    } as any);
    return this.commentsRepo.save(c);
  }
}