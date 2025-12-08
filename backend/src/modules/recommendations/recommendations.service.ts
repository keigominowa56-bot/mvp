import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Post } from '../posts/post.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
  ) {}

  // ダミー: 最近作成されたユーザー上位を返す
  async getPublicRecommendations(limit: number) {
    const list = await this.users.find({
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
    return list.map((u) => ({
      id: u.id,
      email: u.email,
      role: (u as any).role,
      createdAt: (u as any).createdAt,
    }));
  }
}