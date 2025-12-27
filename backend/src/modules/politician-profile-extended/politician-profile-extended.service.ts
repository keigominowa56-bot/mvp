import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoliticianProfileExtended } from '../../entities/politician-profile-extended.entity';

@Injectable()
export class PoliticianProfileExtendedService {
  constructor(
    @InjectRepository(PoliticianProfileExtended)
    private readonly repo: Repository<PoliticianProfileExtended>,
  ) {}

  async getProfile(userId: string) {
    let profile = await this.repo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.repo.create({ userId });
      await this.repo.save(profile);
    }
    return profile;
  }

  async upsertProfile(userId: string, dto: {
    name?: string;
    profileImageUrl?: string;
    district?: string;
    party?: string;
    bio?: string;
    pledges?: string;
    socialLinks?: Record<string, string>;
  }) {
    let profile = await this.repo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.repo.create({ userId, ...dto });
    } else {
      Object.assign(profile, dto);
    }
    return this.repo.save(profile);
  }
}

