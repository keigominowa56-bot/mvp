import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PoliticianProfile, FundingSpendingItem } from 'src/entities/politician-profile.entity';
import { User } from 'src/entities/user.entity';
import { Party } from 'src/entities/party.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@Injectable()
export class PoliticiansService {
  constructor(
    @InjectRepository(PoliticianProfile) private readonly profiles: Repository<PoliticianProfile>,
    @InjectRepository(FundingSpendingItem) private readonly spending: Repository<FundingSpendingItem>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Party) private readonly parties: Repository<Party>,
  ) {}

  async getProfile(id: string) {
    const profile = await this.profiles.findOne({
      where: { id },
      relations: ['user', 'party', 'spendingItems'],
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(id: string, editorUserId: string, dto: any) {
    const profile = await this.getProfile(id);
    if (profile.userId !== editorUserId) {
      const editor = await this.users.findOne({ where: { id: editorUserId } });
      if (!editor || (editor.role !== UserRoleEnum.ADMIN && editor.id !== profile.userId)) {
        throw new ForbiddenException('Only the owner or admin can update profile');
      }
    }

    if (dto.partyId) {
      const party = await this.parties.findOne({ where: { id: dto.partyId } });
      if (!party) throw new NotFoundException('Party not found');
      profile.partyId = party.id;
    }

    profile.bio = dto.bio ?? profile.bio;
    profile.age = dto.age ?? profile.age;
    profile.pledges = dto.pledges ?? profile.pledges;
    profile.fundingReportUrl = dto.fundingReportUrl ?? profile.fundingReportUrl;

    await this.profiles.save(profile);
    return this.getProfile(id);
  }

  async search(query: { region?: string; party?: string; q?: string }) {
    const qb = this.profiles.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('p.party', 'party');

    if (query.q) qb.andWhere('(user.name ILIKE :q OR p.bio ILIKE :q)', { q: `%${query.q}%` });
    if (query.party) qb.andWhere('party.id = :pid OR party.name ILIKE :pname', { pid: query.party, pname: `%${query.party}%` });
    if (query.region) {
      qb.leftJoin('user.region', 'region')
        .andWhere('region.id = :rid OR region.name ILIKE :rname', { rid: query.region, rname: `%${query.region}%` });
    }

    qb.orderBy('p.updatedAt', 'DESC');
    return qb.getMany();
  }

  async fundingSummary(id: string): Promise<{ category: string; amount: number }[]> {
    const items = await this.spending.find({ where: { politicianProfileId: id } });
    const sum: Record<string, number> = {};
    for (const it of items) {
      sum[it.category] = (sum[it.category] || 0) + it.amount;
    }
    return Object.entries(sum).map(([category, amount]) => ({ category, amount }));
  }
}