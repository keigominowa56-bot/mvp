import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoliticianProfile } from '../../entities/politician-profile.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { Party } from '../../entities/party.entity';
import { PostType } from '../../enums/post-type.enum';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(PoliticianProfile) private readonly profiles: Repository<PoliticianProfile>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(User) private readonly _users: Repository<User>,
    @InjectRepository(Party) private readonly _parties: Repository<Party>,
  ) {}

  async searchPoliticians(params: { region?: string; party?: string; q?: string }) {
    const qb = this.profiles.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('p.party', 'party');

    if (params.q) qb.andWhere('(user.name ILIKE :q OR p.bio ILIKE :q)', { q: `%${params.q}%` });
    if (params.party) qb.andWhere('party.id = :partyId OR party.name ILIKE :partyName', { partyId: params.party, partyName: `%${params.party}%` });
    if (params.region) {
      qb.leftJoin('user.region', 'region')
        .andWhere('region.id = :regionId OR region.name ILIKE :regionName', {
          regionId: params.region,
          regionName: `%${params.region}%`,
        });
    }

    qb.orderBy('p.updatedAt', 'DESC');
    return qb.getMany();
  }

  async searchPosts(params: { q?: string; type?: PostType }) {
    const qb = this.posts.createQueryBuilder('p').leftJoinAndSelect('p.author', 'author');

    if (params.q) qb.andWhere('(p.title ILIKE :q OR p.content ILIKE :q)', { q: `%${params.q}%` });
    if (params.type) qb.andWhere('p.type = :type', { type: params.type });

    qb.orderBy('p.createdAt', 'DESC');
    return qb.getMany();
  }
}