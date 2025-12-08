import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog) private readonly repo: Repository<ActivityLog>,
  ) {}

  async log(actorUserId: string | null, action: string, data: Record<string, any>) {
    // 暫定：actorUserId をエンティティに存在しないため保存対象から外す
    const log = this.repo.create({
      action,
      // エンティティの型に合わせてフィールド名を調整する必要があります
      // ひとまず "data" フィールドが文字列である前提で JSON を格納
      // もしエンティティで dataJson や payload など別名なら、後で修正します
      data: JSON.stringify(data ?? {}),
    } as Partial<ActivityLog>);
    return this.repo.save(log);
  }
}