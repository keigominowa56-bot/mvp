import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PoliticianProfile, FundingSpendingItem } from '../../entities/politician-profile.entity';
import { User } from '../../entities/user.entity';
import { Party } from '../../entities/party.entity';
import { UpdatePoliticianDto } from './dto/update-politician.dto';
import { SearchPoliticiansDto } from './dto/search-politicians.dto';
import { UserRole } from '../../enums/user-role.enum';

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

  async updateProfile(id: string, editorUserId: string, dto: UpdatePoliticianDto) {
    const profile = await this.getProfile(id);
    // 本人のみ更新可
    if (profile.userId !== editorUserId) {
      // 追加ルール: 管理者は許可
      const editor = await this.users.findOne({ where: { id: editorUserId } });
      if (!editor || (editor.role !== UserRole.ADMIN && editor.id !== profile.userId)) {
        throw new ForbiddenException('Only the owner or admin can update profile');
      }
    }

    // partyId の解決（存在チェック）
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

  async search(input: SearchPoliticiansDto) {
    // 簡易検索: ユーザー名/プロフィールbioに対して ILike、party/region はID指定を想定
    const qb = this.profiles.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('p.party', 'party');

    if (input.q) {
      qb.andWhere('(user.name ILIKE :q OR p.bio ILIKE :q)', { q: `%${input.q}%` });
    }

    if (input.party) {
      qb.andWhere('party.id = :partyId OR party.name ILIKE :partyName', { partyId: input.party, partyName: `%${input.party}%` });
    }

    // region: ユーザーに region がある前提なら join してフィルタ（簡易実装）
    if (input.region) {
      qb.leftJoin('user.region', 'region')
        .andWhere('region.id = :regionId OR region.name ILIKE :regionName', {
          regionId: input.region,
          regionName: `%${input.region}%`,
        });
    }

    qb.orderBy('p.updatedAt', 'DESC');
    return qb.getMany();
  }

  async fundingSummary(profileId: string) {
    // カテゴリ別集計
    const rows = await this.spending.find({ where: { politicianProfileId: profileId } });
    const summary: Record<string, number> = {};
    for (const r of rows) {
      summary[r.category] = (summary[r.category] || 0) + r.amount;
    }
    // グラフライブラリ用の形式に変換
    const series = Object.entries(summary).map(([category, amount]) => ({ category, amount }));
    return { profileId, series, total: series.reduce((a, b) => a + b.amount, 0) };
  }

  async ensureProfileForUser(userId: string) {
    // ユーザーが POLITICIAN の場合は初期プロフィールを自動作成
    let profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) {
      const user = await this.users.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      profile = this.profiles.create({ userId, bio: null, age: null, partyId: null, pledges: [], fundingReportUrl: null });
      await this.profiles.save(profile);
    }
    return profile;
  }
}