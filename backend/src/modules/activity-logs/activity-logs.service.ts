import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) {}

  async create(dto: CreateActivityLogDto) {
    const log = this.repo.create(dto);
    return this.repo.save(log);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) throw new NotFoundException('ActivityLog not found');
    return log;
  }

  async update(id: string, dto: UpdateActivityLogDto) {
    const log = await this.findOne(id);
    Object.assign(log, dto);
    return this.repo.save(log);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const log = await this.findOne(id);
    await this.repo.remove(log);
    return { deleted: true, id };
  }

  // 追加メソッド: コントローラや他サービスが使っている
  async findByMemberId(memberId: string) {
    return this.repo.find({ where: { memberId }, order: { createdAt: 'DESC' } });
  }

  async findByExternalId(externalId: string) {
    return this.repo.findOne({ where: { externalId } });
  }
}