import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from 'src/entities/policy.entity';

@Injectable()
export class PoliciesService {
  constructor(@InjectRepository(Policy) private readonly policyRepo: Repository<Policy>) {}

  async list(politicianId?: string) {
    const where = politicianId ? { politicianId } : {};
    return this.policyRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async create(
    politicianId: string,
    body: { title: string; content?: string; description?: string; category?: string; status?: string },
  ) {
    const content = body.content ?? body.description ?? '';
    const p = this.policyRepo.create({
      politicianId,
      title: body.title,
      content,
      category: body.category ?? null,
      status: body.status ?? 'draft',
    } as any);
    return this.policyRepo.save(p);
  }

  async update(id: string, _actor: string | { id: string }, patch: Partial<Policy>) {
    await this.policyRepo.update({ id }, patch);
    return this.policyRepo.findOne({ where: { id } });
  }
}