// 差し替え: actionOnTarget 内で hidden フィールドを扱う
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../entities/report.entity';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User) private readonly _userRepo: Repository<User>,
  ) {}

  async create(data: {
    reporterId: string;
    targetType: 'post' | 'comment' | 'user';
    targetId: string;
    reasonCategory: 'abuse' | 'spam' | 'misinfo' | 'other';
    reasonText?: string;
  }) {
    if (!data.targetType || !data.targetId) throw new BadRequestException('target required');
    if (!data.reasonCategory) throw new BadRequestException('reasonCategory required');
    const r = this.reportRepo.create({
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      reasonCategory: data.reasonCategory,
      reasonText: data.reasonText,
      status: 'open',
    });
    return this.reportRepo.save(r);
  }

  async list(filters: { status?: string; targetType?: string; limit?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.targetType) where.targetType = filters.targetType;
    return this.reportRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: filters.limit || 100,
    });
  }

  async updateStatus(id: string, status: Report['status'], adminNote?: string) {
    const r = await this.reportRepo.findOne({ where: { id } });
    if (!r) throw new BadRequestException('report not found');
    r.status = status;
    if (adminNote) r.adminNote = adminNote;
    return this.reportRepo.save(r);
  }

  async actionOnTarget(report: Report, action: 'ban-user' | 'hide-post' | 'hide-comment') {
    if (action === 'ban-user' && report.targetType === 'user') {
      // TODO: User entity needs a 'status' field to implement ban functionality
      // const u = await this.userRepo.findOne({ where: { id: report.targetId } });
      // if (u) {
      //   u.status = 'banned';
      //   await this.userRepo.save(u);
      // }
    }
    if (action === 'hide-post' && report.targetType === 'post') {
      const p = await this.postRepo.findOne({ where: { id: report.targetId } });
      if (p) {
        p.hidden = true;
        await this.postRepo.save(p);
      }
    }
    if (action === 'hide-comment' && report.targetType === 'comment') {
      const c = await this.commentRepo.findOne({ where: { id: report.targetId } });
      if (c) {
        c.hidden = true;
        await this.commentRepo.save(c);
      }
    }
    report.status = 'actioned';
    return this.reportRepo.save(report);
  }
}