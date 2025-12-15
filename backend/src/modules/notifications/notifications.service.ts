import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>) {}

  async listForUser(userId: string) {
    return this.notifications.find({
      where: { userId, readAt: IsNull() } as FindOptionsWhere<Notification>,
      order: { createdAt: 'DESC' },
    });
  }

  async listUnread(userId: string) {
    return this.notifications.find({
      where: { userId, readAt: IsNull() } as FindOptionsWhere<Notification>,
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(id: string, userId: string) {
    const notif = await this.notifications.findOne({
      where: { id, userId } as FindOptionsWhere<Notification>,
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.readAt = new Date();
    await this.notifications.save(notif);
    return { ok: true };
  }
}