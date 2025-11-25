import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  async create(user: any, postId: number, dto: CreateCommentDto) {
    const comment = this.repo.create({
      postId,
      authorId: user.id,
      body: dto.body,
      media: dto.images ? { images: dto.images } : null
    });
    return this.repo.save(comment);
  }

  async findByPost(postId: number) {
    return this.repo.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }
}
