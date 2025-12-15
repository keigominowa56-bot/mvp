import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from 'src/entities/post.entity';
import { Politician } from 'src/entities/politician.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Politician) private readonly politicians: Repository<Politician>,
  ) {}

  async searchPoliticians(params: { region?: string; party?: string; q?: string }) {
    let qb: SelectQueryBuilder<Politician> = this.politicians.createQueryBuilder('p');
    if (params.region) qb = qb.andWhere('p.regionId = :region', { region: params.region });
    if (params.party) qb = qb.andWhere('p.partyId = :party', { party: params.party });
    if (params.q) qb = qb.andWhere('p.name LIKE :q OR p.nickname LIKE :q', { q: `%${params.q}%` });
    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }

  async searchPosts(params: { q?: string; type?: string }) {
    let qb = this.posts.createQueryBuilder('p');
    if (params.type) qb = qb.andWhere('p.type = :type', { type: params.type });
    if (params.q) qb = qb.andWhere('p.title LIKE :q OR p.content LIKE :q', { q: `%${params.q}%` });
    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }
}