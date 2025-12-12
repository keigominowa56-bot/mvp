import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../../entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(@InjectRepository(Follow) private readonly follows: Repository<Follow>) {}

  async follow(userId: string, targetUserId: string) {
    if (userId === targetUserId) throw new ConflictException('Cannot follow yourself');
    const existing = await this.follows.findOne({ where: { followerUserId: userId, targetUserId } });
    if (existing) throw new ConflictException('Already following');
    const record = this.follows.create({ followerUserId: userId, targetUserId });
    return this.follows.save(record);
  }

  async unfollow(userId: string, targetUserId: string) {
    const existing = await this.follows.findOne({ where: { followerUserId: userId, targetUserId } });
    if (!existing) return { ok: true };
    await this.follows.delete(existing.id);
    return { ok: true };
  }

  async listFollowedIds(userId: string): Promise<string[]> {
    const rows = await this.follows.find({ where: { followerUserId: userId } });
    return rows.map((r) => r.targetUserId);
  }
}