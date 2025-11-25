import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';

@Injectable()
export class FollowsService {
  constructor(@InjectRepository(Follow) private repo: Repository<Follow>) {}

  async follow(user: any, toUserId: number) {
    if (user.id === toUserId) throw new BadRequestException('自分自身はフォローできません');
    const f = this.repo.create({ fromUserId: user.id, toUserId });
    try {
      return await this.repo.save(f);
    } catch {
      throw new BadRequestException('既にフォロー済みです');
    }
  }

  async unfollow(user: any, toUserId: number) {
    await this.repo.delete({ fromUserId: user.id, toUserId });
    return { ok: true };
  }

  async listFollowing(userId: number) {
    return this.repo.find({ where: { fromUserId: userId } });
  }
}
