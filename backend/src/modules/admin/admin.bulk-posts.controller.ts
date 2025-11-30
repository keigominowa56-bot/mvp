import { Controller, Post, Body, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post as PostEntity } from '../posts/post.entity';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Controller('admin/bulk-posts')
@UseGuards(JwtAuthGuard)
export class AdminBulkPostsController {
  constructor(
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private async ensureOperatorPolitician() {
    const email = 'operator@example.com';
    let u = await this.userRepo.findOne({ where: { email } });
    if (!u) {
      const passwordHash = await bcrypt.hash('operator-temp-pass', 10);
      u = this.userRepo.create({
        email,
        passwordHash,
        role: 'politician',
        name: '運営',
        party: '運営事務局',
        kycStatus: 'verified',
        planTier: 'pro',
      });
      u = await this.userRepo.save(u);
    }
    return u;
  }

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admins only');
  }

  // JSON配列: [{ title?, body, tags?, authorId? }]
  @Post('json')
  async bulkJson(@Body() body: { items: Array<{ title?: string; body: string; tags?: string[]; authorId?: string }> }, @Request() req: any) {
    this.ensureAdmin(req);
    if (!body?.items || !Array.isArray(body.items)) throw new BadRequestException('items required');
    const operator = await this.ensureOperatorPolitician();
    const results: Array<{ index: number; created: boolean; id?: string; error?: string }> = [];
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      try {
        const authorId = item.authorId || operator.id;
        if (!item.body?.trim()) throw new Error('body required');
        const p = this.postRepo.create({
          authorId,
          body: item.body,
          title: item.title,
          tags: item.tags as any,
        } as Partial<PostEntity>);
        const saved = await this.postRepo.save(p);
        results.push({ index: i, created: true, id: saved.id });
      } catch (e: any) {
        results.push({ index: i, created: false, error: e.message });
      }
    }
    return { count: results.length, results };
  }

  // CSV (title,body,tags,authorId)
  // Content-Type: text/csv
  @Post('csv')
  async bulkCsv(@Body() csvText: string, @Request() req: any) {
    this.ensureAdmin(req);
    if (!csvText || typeof csvText !== 'string') throw new BadRequestException('CSV text required');
    let parseCsvSync: any;
    try {
      parseCsvSync = require('csv-parse/sync').parse;
    } catch {
      throw new BadRequestException('csv-parse not installed. npm i csv-parse');
    }
    let records: any[];
    try {
      records = parseCsvSync(csvText, { columns: true, skip_empty_lines: true, trim: true });
    } catch (e: any) {
      throw new BadRequestException('CSV parse failed: ' + e.message);
    }
    return this.bulkJson({ items: records } as any, req);
  }
}