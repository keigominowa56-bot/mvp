import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from '../../entities/reaction.entity';
import { ReactionType } from '../../enums/reaction-type.enum';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private readonly repo: Repository<Reaction>,
  ) {}

  async getSummary(targetId: string) {
    const like = await this.repo.count({ where: { targetId, type: ReactionType.LIKE } });
    const agree = await this.repo.count({ where: { targetId, type: ReactionType.AGREE } });
    const disagree = await this.repo.count({ where: { targetId, type: ReactionType.DISAGREE } });
    return { like, agree, disagree };
  }

  async getMyReaction(targetId: string, userId: string) {
    const found = await this.repo.findOne({ where: { targetId, userId } });
    return { reaction: found ? found.type : null };
  }

  async toggle(targetId: string, userId: string, type: ReactionType) {
    const existing = await this.repo.findOne({ where: { targetId, userId } });
    if (existing) {
      if (existing.type === type) {
        // 同じリアクション → 削除
        await this.repo.remove(existing);
        return { reaction: null };
      } else {
        // 違うリアクション → 更新
        existing.type = type;
        await this.repo.save(existing);
        return { reaction: existing.type };
      }
    } else {
      const created = this.repo.create({ targetId, userId, type });
      await this.repo.save(created);
      return { reaction: created.type };
    }
  }
}