import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';
import { NotificationType } from 'src/enums/notification-type.enum';

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

  async listAll(userId: string) {
    return this.notifications.find({
      where: { userId } as FindOptionsWhere<Notification>,
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.count({
      where: { userId, readAt: IsNull() } as FindOptionsWhere<Notification>,
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

  async delete(id: string, userId: string) {
    const notif = await this.notifications.findOne({
      where: { id, userId } as FindOptionsWhere<Notification>,
    });
    if (!notif) throw new NotFoundException('Notification not found');
    await this.notifications.remove(notif);
    return { ok: true };
  }

  async create(userId: string, type: NotificationType, title: string, body: string, options?: {
    postId?: string;
    commentId?: string;
    commentContent?: string;
  }) {
    const notification = this.notifications.create({
      userId,
      type,
      title,
      body,
      postId: options?.postId || null,
      commentId: options?.commentId || null,
      commentContent: options?.commentContent || null,
    });
    return this.notifications.save(notification);
  }
}