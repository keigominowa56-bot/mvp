import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { FundingRecord } from '../../entities/funding-record.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FundingService {
  constructor(
    @InjectRepository(FundingRecord) private readonly frRepo: Repository<FundingRecord>,
    @InjectRepository(User) private readonly _userRepo: Repository<User>,
  ) {}

  async list(politicianId: string, from?: string, to?: string) {
    const where: any = { politicianId };
    if (from && to) where.date = Between(from, to);
    const items = await this.frRepo.find({ where, order: { date: 'DESC' } });
    return items;
  }

  async summary(politicianId: string, from?: string, to?: string) {
    const items = await this.list(politicianId, from, to);
    const byCategory: Record<string, number> = {};
    let total = 0;
    for (const r of items) {
      const c = r.category || 'その他';
      byCategory[c] = (byCategory[c] || 0) + r.amount;
      total += r.amount;
    }
    return { total, byCategory };
  }

  async create(politicianId: string, actor: User, data: { amount: number; category?: string; description?: string; date?: string }) {
    if (actor.role !== 'admin' && actor.id !== politicianId) {
      throw new ForbiddenException('not allowed');
    }
    if (!data.amount || data.amount <= 0) throw new BadRequestException('amount must be > 0');
    const fr = this.frRepo.create({
      politicianId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date || new Date().toISOString().slice(0, 10),
    });
    return this.frRepo.save(fr);
  }
}