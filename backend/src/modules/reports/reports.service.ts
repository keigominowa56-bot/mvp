import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Report, ReportStatus } from 'src/entities/report.entity';
import { User } from 'src/entities/user.entity';
import { Post } from 'src/entities/post.entity';
import { Comment } from 'src/entities/comment.entity';

type ReportTargetType = 'user' | 'post' | 'comment';

// ヘルパー: 文字列を許容セットへ安全に変換
function normalizeStatus(input?: string): ReportStatus | undefined {
  if (!input) return undefined;
  const allowed: ReportStatus[] = [
    'pending',
    'reviewed',
    'actioned',
    'rejected',
    'open',
    'reviewing',
    'resolved',
    'dismissed',
  ];
  const s = input.toLowerCase();
  return (allowed as string[]).includes(s) ? (s as ReportStatus) : undefined;
}
function normalizeTargetType(input?: string): ReportTargetType | undefined {
  if (!input) return undefined;
  const allowed: ReportTargetType[] = ['user', 'post', 'comment'];
  const t = input.toLowerCase();
  return (allowed as string[]).includes(t) ? (t as ReportTargetType) : undefined;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly repo: Repository<Report>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
  ) {}

  async create(data: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    type: string;
    details?: Record<string, any>;
    reasonCategory?: string;
    reasonText?: string;
  }) {
    const composedDetails: Record<string, any> | null =
      data.details || data.reasonCategory || data.reasonText
        ? {
            ...(data.details ?? {}),
            ...(data.reasonCategory ? { reasonCategory: data.reasonCategory } : {}),
            ...(data.reasonText ? { reasonText: data.reasonText } : {}),
          }
        : null;

    const r = this.repo.create({
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      type: data.type,
      reasonCategory: data.reasonCategory || null,
      reasonText: data.reasonText || null,
      data: composedDetails,
      status: 'pending',
      adminNote: null,
    } as any);
    return this.repo.save(r);
  }

  async updateStatus(id: string, status: ReportStatus, adminNote?: string) {
    const r = await this.repo.findOne({ where: { id } as FindOptionsWhere<Report> });
    if (!r) throw new NotFoundException('report not found');
    r.status = status;
    if (adminNote) r.adminNote = adminNote;
    return this.repo.save(r);
  }

  // 文字列パラメータを受けて内部で正規化する
  async list(params: { status?: string; targetType?: string; limit?: number }) {
    const where: any = {};
    const ns = normalizeStatus(params.status);
    const nt = normalizeTargetType(params.targetType);
    if (ns) where.status = ns;
    if (nt) where.targetType = nt;
    const take = params.limit && Number.isFinite(params.limit) ? Math.max(1, Math.min(params.limit, 200)) : 100;
    const reports = await this.repo.find({ where, order: { createdAt: 'DESC' }, take });
    
    // 通報者名を取得
    const reportsWithNames = await Promise.all(
      reports.map(async (report) => {
        const reporter = await this.userRepo.findOne({ where: { id: report.reporterId } });
        return {
          ...report,
          reporterName: reporter?.name || null,
        };
      })
    );
    
    return reportsWithNames;
  }

  async action(id: string, action: 'ban-user' | 'hide-post' | 'hide-comment') {
    const report = await this.repo.findOne({ where: { id } as FindOptionsWhere<Report> });
    if (!report) throw new NotFoundException('report not found');
    return this.actionOnTarget(report, action);
  }

  async actionOnTarget(report: Report, action: 'ban-user' | 'hide-post' | 'hide-comment') {
    if (action === 'ban-user' && report.targetType === 'user') {
      const u = await this.userRepo.findOne({ where: { id: report.targetId } as FindOptionsWhere<User> });
      if (u && 'status' in u) {
        (u as any).status = 'banned';
        await this.userRepo.save(u);
      }
    }

    if (action === 'hide-post' && report.targetType === 'post') {
      const p = await this.postRepo.findOne({ where: { id: report.targetId } as FindOptionsWhere<Post> });
      if (p && 'status' in p) {
        (p as any).status = 'hidden';
        await this.postRepo.save(p);
      }
    }

    if (action === 'hide-comment' && report.targetType === 'comment') {
      const c = await this.commentRepo.findOne({ where: { id: report.targetId } as FindOptionsWhere<Comment> });
      if (c && 'status' in c) {
        (c as any).status = 'hidden';
        await this.commentRepo.save(c);
      }
    }

    report.status = 'actioned';
    return this.repo.save(report);
  }
}