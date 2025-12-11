import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../../entities/follow.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async follow(followerUserId: string, targetUserId: string) {
    if (followerUserId === targetUserId) throw new ConflictException('Cannot follow yourself');

    const target = await this.users.findOne({ where: { id: targetUserId } });
    if (!target) throw new NotFoundException('Target user not found');

    const existing = await this.follows.findOne({ where: { followerUserId, targetUserId } });
    if (existing) throw new ConflictException('Already following');

    const record = this.follows.create({ followerUserId, targetUserId });
    return this.follows.save(record);
  }

  async unfollow(followerUserId: string, targetUserId: string) {
    const existing = await this.follows.findOne({ where: { followerUserId, targetUserId } });
    if (!existing) return { ok: true };
    await this.follows.delete(existing.id);
    return { ok: true };
  }

  async followersDemographics(targetUserId: string) {
    // フォロワーの年代/地域/支持政党の分布を簡易集計
    const rows = await this.follows
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.follower', 'user')
      .leftJoinAndSelect('user.region', 'region')
      .leftJoinAndSelect('user.supportedParty', 'party')
      .where('f.targetUserId = :targetUserId', { targetUserId })
      .getMany();

    const demographics = {
      ageGroup: {} as Record<string, number>,
      region: {} as Record<string, number>,
      party: {} as Record<string, number>,
      total: rows.length,
    };

    for (const r of rows) {
      const age = (r.follower as any)?.ageGroup ?? 'unknown';
      demographics.ageGroup[age] = (demographics.ageGroup[age] || 0) + 1;

      const regionName = (r.follower as any)?.region?.name ?? 'unknown';
      demographics.region[regionName] = (demographics.region[regionName] || 0) + 1;

      const partyName = (r.follower as any)?.supportedParty?.name ?? 'unknown';
      demographics.party[partyName] = (demographics.party[partyName] || 0) + 1;
    }

    return demographics;
  }
}