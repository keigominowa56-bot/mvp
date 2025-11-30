import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Follow } from '../follows/follow.entity';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
  ) {}

  @Get()
  async list(
    @Query('limit') limitQ?: string,
    @Query('q') q?: string,
    @Query('party') party?: string,
    @Query('pref') pref?: string,
    @Query('city') city?: string,
  ) {
    const limit = Math.min(50, Math.max(1, Number(limitQ) || 8));

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoin(Follow, 'f', 'f.politicianId = u.id')
      .where('u.role = :role', { role: 'politician' })
      .select([
        'u.id AS id',
        'u.name AS name',
        'u.email AS email',
        'u.addressPref AS addressPref',
        'u.addressCity AS addressCity',
        'u.party AS party',
        'COUNT(f.id) AS followers',
      ]);

    if (q && q.trim() !== '') {
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

    qb.groupBy('u.id')
      .addGroupBy('u.name')
      .addGroupBy('u.email')
      .addGroupBy('u.addressPref')
      .addGroupBy('u.addressCity')
      .addGroupBy('u.party')
      .orderBy('followers', 'DESC')
      .addOrderBy('u.createdAt', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<{
      id: string;
      name: string | null;
      email: string;
      addressPref: string | null;
      addressCity: string | null;
      party: string | null;
      followers: string | number | null;
    }>();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      addressPref: r.addressPref,
      addressCity: r.addressCity,
      party: r.party,
      followerCount: Number(r.followers || 0),
    }));
  }
}