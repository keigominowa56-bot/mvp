import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

export type CreateActivityLogDto = {
  memberId: string;
  type: string;
  detail?: string;
  source?: string;
  externalId?: string;
  publishedAt?: Date;
};

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) {}

  async create(dto: CreateActivityLogDto) {
    const entity = this.repo.create({
      type: dto.type,
      detail: dto.detail,
      source: dto.source,
      externalId: dto.externalId,
      publishedAt: dto.publishedAt,
      member: { id: dto.memberId } as any,
    } as Partial<ActivityLog>);
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({
      relations: ['member'],
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      take: 200,
    });
  }

  async findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['member'],
    });
  }

  async findByExternalId(externalId: string) {
    if (!externalId) return null;
    return this.repo.findOne({ where: { externalId } });
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}