import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Funding } from 'src/entities/funding.entity';

function toDate(d?: string | Date): Date | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

@Injectable()
export class FundingService {
  constructor(@InjectRepository(Funding) private readonly fundingRepo: Repository<Funding>) {}

  async list(id?: string, from?: string | Date, to?: string | Date) {
    const where: any = {};
    if (id) where.politicianId = id;
    const fromDate = toDate(from);
    const toDateVal = toDate(to);
    if (fromDate && toDateVal) where.createdAt = Between(fromDate, toDateVal);
    return this.fundingRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async summary(id: string, from?: string | Date, to?: string | Date) {
    const items = await this.list(id, from, to);
    const total = items.reduce((sum, f) => sum + (f.amount || 0), 0);
    return { total, count: items.length };
  }

  async create(politicianId: string, actor: string | { id: string }, body: { amount: number; note?: string }) {
    const actorUserId = typeof actor === 'string' ? actor : actor.id;
    const f = this.fundingRepo.create({
      politicianId,
      actorUserId,
      amount: body.amount,
      note: body.note ?? null,
    } as any);
    return this.fundingRepo.save(f);
  }
}