import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Politician } from 'src/entities/politician.entity';

@Injectable()
export class PoliticiansService {
  constructor(@InjectRepository(Politician) private readonly repo: Repository<Politician>) {}

  async getProfile(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async updateProfile(id: string, _editorUserId: string, dto: Partial<Politician>) {
    await this.repo.update({ id }, dto);
    return this.getProfile(id);
  }

  async search(params: { region?: string; party?: string; q?: string }) {
    let qb: SelectQueryBuilder<Politician> = this.repo.createQueryBuilder('p');
    if (params.region) qb = qb.andWhere('p.regionId = :region', { region: params.region });
    if (params.party) qb = qb.andWhere('p.partyId = :party', { party: params.party });
    if (params.q) qb = qb.andWhere('p.name LIKE :q OR p.nickname LIKE :q', { q: `%${params.q}%` });
    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }

  async fundingSummary(id: string) {
    return { politicianId: id, total: 0, count: 0 };
  }
}