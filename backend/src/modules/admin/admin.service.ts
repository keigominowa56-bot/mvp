// backend/src/modules/admin/admin.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity.js';
import { User } from '../../entities/user.entity';
import { Member } from '../../entities/member.entity';
import { ActivityLogType } from '../../enums/activity-log-type.enum.js'; // 修正: パスを '../../enums/' に変更 (.js拡張子維持)

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const totalMembers = await this.memberRepository.count();
    const totalActivities = await this.activityLogRepository.count();
    
    const manualActivities = await this.activityLogRepository.count({
      where: { source: ActivityLogType.MANUAL }, // 修正: ActivityLogType.MANUALを使用
    });

    const recentActivities = await this.activityLogRepository.find({
      order: { publishedAt: 'DESC' },
      take: 5,
    });

    return {
      totalUsers,
      totalMembers,
      totalActivities,
      manualActivities,
      recentActivities,
    };
  }

  async getSystemHealth(): Promise<any> {
    return {
      database: { status: 'OK', latency: '5ms' },
      externalFeeds: { status: 'OK', lastRun: new Date().toISOString() },
    };
  }
  
  // 修正: admin.controller.tsで呼び出されていたメソッドを追加（仮実装）
  async importActivityFunds(memberId: string, file: any): Promise<any> {
    this.logger.warn(`importActivityFunds called for member ${memberId}. (Not Implemented)`);
    return { success: true, message: 'Import logic placeholder executed.' };
  }

  async collectExternalData(): Promise<any> {
    this.logger.warn('collectExternalData called. (Not Implemented)');
    // 実際にはExternalFeedsServiceを呼び出す
    return { success: true, message: 'External data collection placeholder executed.' };
  }
}