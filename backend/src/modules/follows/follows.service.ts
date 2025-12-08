import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from '../../entities/follow.entity';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async follow(followerId: string, followeeId: string) {
    if (followerId === followeeId) throw new Error('自分自身はフォローできません');
    const follower = await this.users.findOne({ where: { id: followerId } });
    const followee = await this.users.findOne({ where: { id: followeeId } });
    if (!follower || !followee) throw new Error('ユーザーが存在しません');
    const existing = await this.follows.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
    });
    if (existing) return existing;
    const f = this.follows.create({ follower, followee });
    return this.follows.save(f);
  }

  async unfollow(followerId: string, followeeId: string) {
    const existing = await this.follows.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
    });
    if (!existing) return { ok: true };
    await this.follows.remove(existing);
    return { ok: true };
  }

  async listFollowedIds(followerId: string): Promise<string[]> {
    const rows = await this.follows.find({
      where: { follower: { id: followerId } },
      relations: ['followee'],
    });
    return rows.map((r) => r.followee.id);
  }
}