import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../../entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(@InjectRepository(Follow) private readonly follows: Repository<Follow>) {}

  async listFollowedIds(userId: string): Promise<string[]> {
    const rows = await this.follows.find({ where: { followerUserId: userId } });
    return rows.map((r) => r.targetUserId);
  }

  // 既存の follow/unfollow などはそのまま
}