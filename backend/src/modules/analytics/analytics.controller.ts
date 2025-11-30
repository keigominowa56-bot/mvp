// 既存版に CSV フォーマット対応を追加した改訂版
import { Controller, Get, UseGuards, Request, ForbiddenException, Query, Param, BadRequestException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Vote } from '../votes/vote.entity';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

type SortKey = 'createdAt' | 'support' | 'oppose' | 'total';
type Order = 'asc' | 'desc';

function parseDateOrNull(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Vote) private readonly voteRepo: Repository<Vote>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get('my-posts')
  async myPosts(
    @Request() req: any,
    @Query('from') fromQ?: string,
    @Query('to') toQ?: string,
    @Query('sort') sortQ?: SortKey,
    @Query('order') orderQ?: Order,
  ) {
    if (req.user?.role !== 'politician') throw new ForbiddenException('Only politicians can access');
    const authorId = req.user.sub;
    const from = parseDateOrNull(fromQ);
    const to = parseDateOrNull(toQ);
    const sort: SortKey = (['createdAt', 'support', 'oppose', 'total'] as SortKey[]).includes((sortQ as any)) ? (sortQ as SortKey) : 'createdAt';
    const order: Order = (['asc', 'desc'] as Order[]).includes((orderQ as any)) ? (orderQ as Order) : 'desc';

    const posts = await this.postRepo.find({ where: { authorId }, order: { createdAt: 'DESC' } });
    const results: Array<{ post: any; stats: { support: number; oppose: number; total: number } }> = [];
    for (const p of posts) {
      const whereBase: any = { postId: p.id };
      if (from && to) whereBase.createdAt = Between(from, to);
      else if (from) whereBase.createdAt = Between(from, new Date(8640000000000000));
      else if (to) whereBase.createdAt = Between(new Date(0), to);

      const [support, oppose] = await Promise.all([
        this.voteRepo.count({ where: { ...whereBase, type: 'support' } }),
        this.voteRepo.count({ where: { ...whereBase, type: 'oppose' } }),
      ]);
      results.push({
        post: { id: p.id, title: (p as any).title, createdAt: p.createdAt, updatedAt: p.updatedAt },
        stats: { support, oppose, total: support + oppose },
      });
    }

    results.sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      if (sort === 'createdAt') {
        return (new Date(a.post.createdAt).getTime() - new Date(b.post.createdAt).getTime()) * dir;
      }
      return ((a.stats as any)[sort] - (b.stats as any)[sort]) * dir;
    });

    return results;
  }

  @Get('posts/:postId/segments')
  async postSegments(
    @Request() req: any,
    @Param('postId') postId: string,
    @Query('from') fromQ?: string,
    @Query('to') toQ?: string,
    @Query('format') format?: string,
    @Res() res?: Response,
  ) {
    const me = await this.userRepo.findOne({ where: { id: req.user?.sub } });
    if (!me || me.role !== 'politician') throw new ForbiddenException('Only politicians can access');
    if (me.planTier !== 'pro') throw new ForbiddenException('Pro plan required');

    const from = parseDateOrNull(fromQ);
    const to = parseDateOrNull(toQ);

    const qb = this.voteRepo
      .createQueryBuilder('v')
      .innerJoin(User, 'u', 'u.id = v.userId')
      .where('v.postId = :postId', { postId });

    if (from) qb.andWhere('v.createdAt >= :from', { from });
    if (to) qb.andWhere('v.createdAt <= :to', { to });

    const rows = await qb
      .select(['u.addressPref AS addressPref', 'u.addressCity AS addressCity', 'u.age AS age', 'v.type AS type'])
      .getRawMany<{ addressPref: string | null; addressCity: string | null; age: number | null; type: 'support' | 'oppose' }>();

    const byPref: Record<string, { support: number; oppose: number; total: number }> = {};
    const byCity: Record<string, { support: number; oppose: number; total: number }> = {};
    const ageBuckets: Array<{ key: string; min: number; max: number | null }> = [
      { key: '18-24', min: 18, max: 24 },
      { key: '25-34', min: 25, max: 34 },
      { key: '35-44', min: 35, max: 44 },
      { key: '45-64', min: 45, max: 64 },
      { key: '65+', min: 65, max: null },
    ];
    const byAge: Record<string, { support: number; oppose: number; total: number }> = {};
    for (const b of ageBuckets) byAge[b.key] = { support: 0, oppose: 0, total: 0 };

    for (const r of rows) {
      const pref = r.addressPref || '未設定';
      const city = r.addressCity || '未設定';
      const type = r.type;

      if (!byPref[pref]) byPref[pref] = { support: 0, oppose: 0, total: 0 };
      if (!byCity[city]) byCity[city] = { support: 0, oppose: 0, total: 0 };
      byPref[pref][type]++; byPref[pref].total++;
      byCity[city][type]++; byCity[city].total++;

      const age = r.age ?? null;
      let bucket = '未設定';
      if (age !== null) {
        for (const b of ageBuckets) {
          if (b.max === null ? age >= b.min : age >= b.min && age <= b.max) { bucket = b.key; break; }
        }
      }
      if (!byAge[bucket]) byAge[bucket] = { support: 0, oppose: 0, total: 0 };
      byAge[bucket][type]++; byAge[bucket].total++;
    }

    const result = { byPref, byCity, byAge };

    if (format === 'csv') {
      const rowsOut: string[] = [];
      rowsOut.push('segment_type,key,support,oppose,total');
      const pushRec = (type: string, obj: Record<string, { support: number; oppose: number; total: number }>) => {
        for (const [k, v] of Object.entries(obj)) {
          rowsOut.push(`${type},${k},${v.support},${v.oppose},${v.total}`);
        }
      };
      pushRec('pref', byPref);
      pushRec('city', byCity);
      pushRec('age', byAge);
      const csv = rowsOut.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=segments_${postId}.csv`);
      return res.send(csv);
    }

    return result;
  }
}