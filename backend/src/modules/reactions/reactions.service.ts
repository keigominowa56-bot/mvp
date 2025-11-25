import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './reaction.entity';
import { ReactDto } from './dto/react.dto';

@Injectable()
export class ReactionsService {
  constructor(@InjectRepository(Reaction) private repo: Repository<Reaction>) {}

  private validateType(type: string) {
    if (!['like', 'agree', 'disagree'].includes(type)) {
      throw new BadRequestException('不正なリアクション種別');
    }
  }

  async addOrToggle(user: any, dto: ReactDto) {
    this.validateType(dto.type);
    const existing = await this.repo.findOne({
      where: {
        userId: user.id,
        targetType: dto.targetType,
        targetId: dto.targetId
      }
    });

    // ない → 新規
    if (!existing) {
      const entity = this.repo.create({
        userId: user.id,
        targetType: dto.targetType,
        targetId: dto.targetId,
        type: dto.type
      });
      const saved = await this.repo.save(entity);
      return { action: 'created', reaction: saved };
    }

    // 既存 type と同じ → 削除（トグルOFF）
    if (existing.type === dto.type) {
      await this.repo.delete(existing.id);
      return { action: 'deleted', reaction: null };
    }

    // 別 type → 更新
    existing.type = dto.type;
    const updated = await this.repo.save(existing);
    return { action: 'updated', reaction: updated };
  }

  async myReaction(user: any, targetType: string, targetId: number) {
    return this.repo.findOne({
      where: {
        userId: user.id,
        targetType,
        targetId
      }
    });
  }

  async summary(targetType: string, targetId: number) {
    const rows = await this.repo
      .createQueryBuilder('r')
      .select('r.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('r.targetType = :t AND r.targetId = :i', { t: targetType, i: targetId })
      .groupBy('r.type')
      .getRawMany();
    return rows;
  }
}