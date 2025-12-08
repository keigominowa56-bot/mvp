import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ActivityLogService } from '../activity-logs/activity-log.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly logs: ActivityLogService,
  ) {}

  async sendToUser(
    userId: string,
    data: { type: string; title: string; body?: string; linkUrl?: string },
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const n = this.repo.create({ user, ...data });
    const saved = await this.repo.save(n);

    await this.logs.log(null, 'notification_sent', {
      notificationId: saved.id,
      userId,
      type: data.type,
    });

    return saved;
  }

  async bulkSend(
    userIds: string[],
    data: { type: string; title: string; body?: string; linkUrl?: string },
  ) {
    const results = [];
    for (const uid of userIds) {
      results.push(await this.sendToUser(uid, data));
    }
    return results;
  }

  async listForUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      select: ['id', 'type', 'title', 'body', 'linkUrl', 'readAt', 'createdAt'],
    });
  }

  async markRead(id: string, userId: string) {
    const n = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!n || n.user.id !== userId) throw new NotFoundException('Notification not found');
    n.readAt = new Date();
    return this.repo.save(n);
  }
}