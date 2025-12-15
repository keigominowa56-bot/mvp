import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from 'src/entities/post.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private readonly repo: Repository<Post>) {}

  async create(userId: string, dto: { title: string; content: string; type: string }) {
    const post = this.repo.create({
      title: dto.title,
      content: dto.content,
      type: dto.type,
      authorUserId: userId, // リレーションオブジェクトではなく外部キー
    } as any);
    return this.repo.save(post);
  }

  async list(query: {
    type?: string;
    authorUserId?: string;
    search?: string;
    limit?: number;
    beforeId?: string;
  }) {
    let qb: SelectQueryBuilder<Post> = this.repo.createQueryBuilder('p');

    if (query.type) {
      qb = qb.andWhere('p.type = :type', { type: query.type });
    }
    if (query.authorUserId) {
      qb = qb.andWhere('p.authorUserId = :authorUserId', { authorUserId: query.authorUserId });
    }
    if (query.search) {
      qb = qb.andWhere('(p.title LIKE :search OR p.content LIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.beforeId) {
      qb = qb.andWhere('p.id < :beforeId', { beforeId: query.beforeId });
    }

    qb = qb.orderBy('p.createdAt', 'DESC');

    if (query.limit && Number.isFinite(query.limit)) {
      qb = qb.take(Math.max(1, Math.min(query.limit, 100)));
    } else {
      qb = qb.take(20);
    }

    return qb.getMany();
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}