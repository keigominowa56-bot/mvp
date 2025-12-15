import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/entities/post.entity';

@Injectable()
export class RecommendationsService {
  constructor(@InjectRepository(Post) private readonly posts: Repository<Post>) {}

  async list() {
    // 例: 最近の投稿からダミー推薦
    return this.posts.find({ order: { createdAt: 'DESC' }, take: 10 });
  }
}