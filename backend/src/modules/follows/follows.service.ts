import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async follow(followerId: string, politicianId: string) {
    if (followerId === politicianId) throw new BadRequestException('Cannot follow yourself');
    const target = await this.userRepo.findOne({ where: { id: politicianId } });
    if (!target || target.role !== 'politician') throw new BadRequestException('Target is not a politician');
    const existing = await this.followRepo.findOne({ where: { followerId, politicianId } });
    if (existing) return existing;
    const entity = this.followRepo.create({ followerId, politicianId });
    return this.followRepo.save(entity);
  }

  async unfollow(followerId: string, politicianId: string) {
    const existing = await this.followRepo.findOne({ where: { followerId, politicianId } });
    if (!existing) throw new NotFoundException('Follow not found');
    await this.followRepo.remove(existing);
    return { unfollowed: true };
  }

  async listFollowing(followerId: string) {
    const follows = await this.followRepo.find({ where: { followerId }, order: { createdAt: 'DESC' } });
    const politicianIds = follows.map(f => f.politicianId);
    if (politicianIds.length === 0) return [];
    const users = await this.userRepo.findByIds(politicianIds);
    const map = new Map(users.map(u => [u.id, u]));
    return follows.map(f => {
      const u = map.get(f.politicianId);
      return {
        followId: f.id,
        politicianId: f.politicianId,
        name: u?.name,
        email: u?.email,
        createdAt: f.createdAt,
      };
    });
  }
}