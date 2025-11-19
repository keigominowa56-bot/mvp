// backend/src/modules/activity-logs/activity-logs.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity.js';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto'; // 追加: DTOが存在すると仮定
import { ActivityLogType } from '../../enums/activity-log-type.enum.js';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const activityLog = this.activityLogRepository.create({
      ...createActivityLogDto,
      source: createActivityLogDto.source,
    });
    return this.activityLogRepository.save(activityLog);
  }

  async findAll(): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({ relations: ['member'] });
  }

  async findOne(id: string): Promise<ActivityLog> {
    const activityLog = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['member'],
    });
    if (!activityLog) {
      throw new NotFoundException(`ActivityLog with ID "${id}" not found`);
    }
    return activityLog;
  }

  async findByExternalId(externalId: string): Promise<ActivityLog | null> {
    return this.activityLogRepository.findOne({ where: { externalId } });
  }

  async findByMemberId(memberId: string): Promise<ActivityLog[]> {
    // 修正: findByMemberをfindByMemberIdとして実装済み
    return this.activityLogRepository.find({
      where: { memberId },
      order: { publishedAt: 'DESC' },
    });
  }

  // エラーTS2339修正: updateメソッドを追加
  async update(id: string, updateActivityLogDto: UpdateActivityLogDto): Promise<ActivityLog> {
    const activityLog = await this.findOne(id);
    this.activityLogRepository.merge(activityLog, updateActivityLogDto);
    return this.activityLogRepository.save(activityLog);
  }

  // エラーTS2339修正: removeメソッドを追加
  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const result = await this.activityLogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ActivityLog with ID "${id}" not found`);
    }
    return { deleted: true, id };
  }

  async getStats(): Promise<any> {
      return {
          total: await this.activityLogRepository.count(),
          byType: {
              [ActivityLogType.TWITTER]: await this.activityLogRepository.count({ where: { source: ActivityLogType.TWITTER } }),
              [ActivityLogType.MANUAL]: await this.activityLogRepository.count({ where: { source: ActivityLogType.MANUAL } }),
          }
      };
  }
}