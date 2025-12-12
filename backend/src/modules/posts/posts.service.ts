import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { PostType } from 'src/enums/post-type.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(authorUserId: string, dto: any) {
    const author = await this.users.findOne({ where: { id: authorUserId } });
    if (!author) throw new ForbiddenException('User not found');

    const restricted = [PostType.ACTIVITY, PostType.PLEDGE, PostType.QUESTION];
    if (restricted.includes(dto.type) && author.role !== UserRoleEnum.POLITICIAN && author.role !== UserRoleEnum.ADMIN) {
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
    return this.posts.save(post);
  }

  async list(query: { type?: string; region?: string; q?: string; page?: number; limit?: number }): Promise<Post[]> {
    const qb = this.posts.createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .orderBy('p.createdAt', 'DESC');

    if (query.type) qb.andWhere('p.type = :type', { type: query.type });
    if (query.region) qb.andWhere('p.regionId = :regionId', { regionId: query.region });
    if (query.q) qb.andWhere('(p.title ILIKE :q OR p.content ILIKE :q)', { q: `%${query.q}%` });

    const take = Math.min(parseInt(String(query.limit || '20'), 10), 100);
    qb.take(take);
    return qb.getMany();
  }

  async findById(id: string): Promise<Post | null> {
    return this.posts.findOne({ where: { id }, relations: ['author'] });
  }
}