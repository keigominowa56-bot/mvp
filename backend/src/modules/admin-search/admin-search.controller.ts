import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Notification } from '../../entities/notification.entity';

@Controller('admin/search')
export class AdminSearchController {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Notification) private readonly notifs: Repository<Notification>,
  ) {}

  @Get('posts')
  async searchPosts(
    @Query('q') q?: string,
    @Query('category') category?: 'policy' | 'activity',
    @Query('pref') pref?: string,
    @Query('city') city?: string,
  ) {
    const where: any = { deletedAt: null };
    if (q) {
      // ILike は PostgreSQL が本来の対象。SQLite の場合は LIKE にフォールバックすることがあるため、ここでは簡易に OR 条件に対応させます。
      // TypeORM の find では OR を扱いづらいので QueryBuilder を使う。
      const qb = this.posts.createQueryBuilder('p')
        .where('p.deletedAt IS NULL');
      if (category) qb.andWhere('p.postCategory = :cat', { cat: category });
      if (pref) qb.andWhere('p.regionPref = :pref', { pref });
      if (city) qb.andWhere('p.regionCity = :city', { city });
      qb.andWhere('(p.title LIKE :q OR p.body LIKE :q)', { q: `%${q}%` });
      qb.orderBy('p.createdAt', 'DESC');
      return qb.getMany();
    } else {
      if (category) where.postCategory = category;
      if (pref) where.regionPref = pref;
      if (city) where.regionCity = city;
      return this.posts.find({ where, order: { createdAt: 'DESC' as any } });
    }
  }

  @Get('notifications')
  async searchNotifications(@Query('q') q?: string) {
    if (q) {
      const qb = this.notifs.createQueryBuilder('n')
        .where('(n.title LIKE :q OR n.body LIKE :q OR n.type LIKE :q)', { q: `%${q}%` })
        .orderBy('n.createdAt', 'DESC');
      return qb.getMany();
    }
    return this.notifs.find({ order: { createdAt: 'DESC' as any } });
  }
}