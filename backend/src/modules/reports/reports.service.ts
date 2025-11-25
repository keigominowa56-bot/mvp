import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { Comment } from '../comments/comment.entity'; // パスはプロジェクト構成に合わせて
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepo: Repository<Report>,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>, // 追加
  ) {}

  async create(user: any, dto: CreateReportDto) {
    // 重複通報禁止（任意）
    const exists = await this.reportsRepo.findOne({
      where: {
        reporterId: user.id,
        targetType: dto.targetType,
        targetId: dto.targetId
      }
    });
    if (exists) {
      throw new BadRequestException('すでにこの対象を通報済みです');
    }

    if (dto.targetType === 'comment') {
      const comment = await this.commentsRepo.findOne({ where: { id: dto.targetId } });
      if (!comment) throw new BadRequestException('コメントが存在しません');
      if (comment.authorId === user.id) {
        throw new ForbiddenException('自分のコメントは通報できません');
      }
    }

    const report = this.reportsRepo.create({
      reporterId: user.id,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      status: 'open',
      adminAction: null
    });

    return this.reportsRepo.save(report);
  }

  async findAllAdmin() {
    return this.reportsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async adminAction(id: number, action: string) {
    const report = await this.reportsRepo.findOne({ where: { id } });
    if (!report) return;
    report.status = 'resolved';
    report.adminAction = action;
    return this.reportsRepo.save(report);
  }
}