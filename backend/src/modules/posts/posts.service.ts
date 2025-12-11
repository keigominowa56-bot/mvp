import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UserRole } from '../../enums/user-role.enum';
import { PostType } from '../../enums/post-type.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(authorUserId: string, dto: CreatePostDto) {
    const author = await this.users.findOne({ where: { id: authorUserId } });
    if (!author) throw new ForbiddenException('User not found');

    // 議員のみ: activity/pledge/question（news はシステム/連携で扱う想定）
    const restrictedTypes = [PostType.ACTIVITY, PostType.PLEDGE, PostType.QUESTION];
    if (restrictedTypes.includes(dto.type) && author.role !== UserRole.POLITICIAN && author.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only politicians can create this type');
    }

    const post = this.posts.create({
      authorUserId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      mediaIds: dto.mediaIds ?? null,
      regionId: dto.regionId ?? null,
    });
    const saved = await this.posts.save(post);
    return saved;
  }

  async list(query: QueryPostsDto) {
    const qb = this.posts.createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .orderBy('p.createdAt', 'DESC');

    if (query.type) qb.andWhere('p.type = :type', { type: query.type });
    if (query.region) qb.andWhere('p.regionId = :regionId', { regionId: query.region });
    if (query.q) qb.andWhere('(p.title ILIKE :q OR p.content ILIKE :q)', { q: `%${query.q}%` });

    // 簡易ページネーション（cursor は createdAt/ID を利用するなど拡張可能）
    const take = Math.min(parseInt(query.limit || '20', 10), 100);
    qb.take(take);

    return qb.getMany();
  }

  async findById(id: string) {
    return this.posts.findOne({ where: { id }, relations: ['author'] });
  }
}