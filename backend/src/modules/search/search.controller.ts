import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Post } from '../posts/post.entity';
import { User } from '../../entities/user.entity';

@Controller('search')
export class SearchController {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('type') type?: 'posts' | 'users' | 'all',
    @Query('limit') limitQ?: string,
    @Query('party') party?: string,
    @Query('pref') pref?: string,
    @Query('city') city?: string,
  ) {
    const limit = Math.min(50, Math.max(1, Number(limitQ) || 20));
    const result: any = {};
    const like = q ? ILike(`%${q}%`) : undefined;

    if (!type || type === 'all' || type === 'posts') {
      result.posts = like
        ? await this.postRepo.find({
            where: [{ body: like }, { title: like as any }],
            take: limit,
            order: { createdAt: 'DESC' },
          })
        : [];
    }

    if (!type || type === 'all' || type === 'users') {
      const qb = this.userRepo.createQueryBuilder('u').where('1=1');

      if (like) {
        qb.andWhere('(u.name LIKE :kw OR u.email LIKE :kw)', { kw: `%${q}%` });
      }
      if (party && party.trim() !== '') {
        qb.andWhere('u.party = :party', { party });
      }
      if (pref && pref.trim() !== '') {
        qb.andWhere('u.addressPref = :pref', { pref });
      }
      if (city && city.trim() !== '') {
        qb.andWhere('u.addressCity = :city', { city });
      }

      qb.orderBy('u.createdAt', 'DESC').limit(limit);
      result.users = await qb.getMany();
    }

    return result;
  }
}