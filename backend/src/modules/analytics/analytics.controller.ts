import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Post } from '../posts/post.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  @Get('posts/summary')
  async postsSummary() {
    const total = await this.postRepo.count({ where: { deletedAt: null } });
    const policy = await this.postRepo.count({ where: { postCategory: 'policy', deletedAt: null } as any });
    const activity = await this.postRepo.count({ where: { postCategory: 'activity', deletedAt: null } as any });
    return { total, policy, activity };
  }

  @Get('posts/timeseries')
  async postsTimeseries(@Query('days') days = '30') {
    const n = Math.max(1, Math.min(Number(days) || 30, 365));
    const from = new Date();
    from.setDate(from.getDate() - (n - 1));
    from.setHours(0, 0, 0, 0);

    const rows = await this.postRepo
      .createQueryBuilder('p')
      .select("date(p.createdAt, 'localtime')", 'date')
      .addSelect("sum(case when p.postCategory = 'policy' then 1 else 0 end)", 'policy')
      .addSelect("sum(case when p.postCategory = 'activity' then 1 else 0 end)", 'activity')
      .addSelect('count(*)', 'total')
      .where('p.deletedAt IS NULL')
      .andWhere('p.createdAt >= :from', { from: from.toISOString() })
      .groupBy("date(p.createdAt, 'localtime')")
      .orderBy("date(p.createdAt, 'localtime')", 'ASC')
      .getRawMany<{ date: string; policy: string; activity: string; total: string }>();

    return rows.map((r) => ({
      date: r.date,
      policy: Number(r.policy),
      activity: Number(r.activity),
      total: Number(r.total),
    }));
  }
}