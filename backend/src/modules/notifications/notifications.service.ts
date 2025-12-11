import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotificationType } from '../../enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>) {}

  async notify(userId: string, input: { type: NotificationType; title: string; body: string }) {
    const n = this.notifications.create({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      readAt: null,
    });
    return this.notifications.save(n);
  }

  async listUnread(userId: string) {
    return this.notifications.find({ where: { userId, readAt: null }, order: { createdAt: 'DESC' } });
  }

  async markRead(id: string, userId: string) {
    const n = await this.notifications.findOne({ where: { id, userId } });
    if (!n) return { ok: true };
    n.readAt = new Date();
    await this.notifications.save(n);
    return { ok: true };
  }
}