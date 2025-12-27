import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoliticalFund } from '../../entities/political-fund.entity';

@Injectable()
export class PoliticalFundsService {
  constructor(
    @InjectRepository(PoliticalFund)
    private readonly repo: Repository<PoliticalFund>,
  ) {}

  async list(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async create(userId: string, dto: {
    purpose: string;
    amount: number;
    date: string;
    category?: string;
    notes?: string;
  }) {
    const fund = this.repo.create({
      userId,
      purpose: dto.purpose,
      amount: dto.amount,
      date: new Date(dto.date),
      category: dto.category || null,
      notes: dto.notes || null,
    });
    return this.repo.save(fund);
  }

  async update(id: string, userId: string, dto: {
    purpose?: string;
    amount?: number;
    date?: string;
    category?: string;
    notes?: string;
  }) {
    const fund = await this.repo.findOne({ where: { id } });
    if (!fund) {
      throw new NotFoundException('政治資金記録が見つかりません');
    }
    if (fund.userId !== userId) {
      throw new ForbiddenException('この記録を編集する権限がありません');
    }
    if (dto.purpose) fund.purpose = dto.purpose;
    if (dto.amount !== undefined) fund.amount = dto.amount;
    if (dto.date) fund.date = new Date(dto.date);
    if (dto.category !== undefined) fund.category = dto.category || null;
    if (dto.notes !== undefined) fund.notes = dto.notes || null;
    return this.repo.save(fund);
  }

  async delete(id: string, userId: string) {
    const fund = await this.repo.findOne({ where: { id } });
    if (!fund) {
      throw new NotFoundException('政治資金記録が見つかりません');
    }
    if (fund.userId !== userId) {
      throw new ForbiddenException('この記録を削除する権限がありません');
    }
    await this.repo.remove(fund);
    return { success: true };
  }

  async listPublic(userId: string) {
    // 公開用（認証不要）
    return this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }
}

