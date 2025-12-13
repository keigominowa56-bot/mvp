import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from '../../entities/policy.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy) private readonly policyRepo: Repository<Policy>,
    @InjectRepository(User) private readonly _userRepo: Repository<User>,
  ) {}

  async list(politicianId: string) {
    return this.policyRepo.find({ where: { politicianId }, order: { createdAt: 'DESC' } });
  }

  async create(politicianId: string, data: { title: string; description?: string; category?: string; status?: string }) {
    if (!data.title) throw new BadRequestException('title required');
    const p = this.policyRepo.create({
      politicianId,
      title: data.title,
      description: data.description,
      category: data.category,
      status: (data.status as any) || 'pending',
      publishedAt: new Date(),
    });
    return this.policyRepo.save(p);
  }

  async update(id: string, actor: User, patch: Partial<Policy>) {
    const pol = await this.policyRepo.findOne({ where: { id } });
    if (!pol) throw new BadRequestException('policy not found');
    // Only admin or the politician who owns
    if (actor.role !== 'admin' && actor.id !== pol.politicianId) {
      throw new ForbiddenException('not allowed');
    }
    Object.assign(pol, patch);
    return this.policyRepo.save(pol);
  }
}