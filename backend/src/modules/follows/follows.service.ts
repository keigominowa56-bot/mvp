import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../../entities/follow.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async follow(userId: string, targetUserId: string) {
    if (userId === targetUserId) throw new ConflictException('Cannot follow yourself');
    const existing = await this.follows.findOne({ where: { followerUserId: userId, targetUserId } });
    if (existing) throw new ConflictException('Already following');
    const record = this.follows.create({ followerUserId: userId, targetUserId });
    return this.follows.save(record);
  }

  async unfollow(userId: string, targetUserId: string) {
    const existing = await this.follows.findOne({ where: { followerUserId: userId, targetUserId } });
    if (!existing) return { ok: true };
    await this.follows.delete(existing.id);
    return { ok: true };
  }

  async listFollowedIds(userId: string): Promise<string[]> {
    const rows = await this.follows.find({ where: { followerUserId: userId } });
    return rows.map((r) => r.targetUserId);
  }

  async listFollowedUsers(userId: string): Promise<any[]> {
    const rows = await this.follows.find({ where: { followerUserId: userId } });
    const targetUserIds = rows.map((r) => r.targetUserId);
    if (targetUserIds.length === 0) return [];
    const users = await this.users.find({ 
      where: targetUserIds.map(id => ({ id })) as any,
    });
    const politicians = users.filter(u => u.role === 'politician'); // 議員のみ返す
    
    // 拡張プロフィール情報を取得
    const { PoliticianProfileExtended } = await import('../../entities/politician-profile-extended.entity');
    const extendedRepo = this.users.manager.getRepository(PoliticianProfileExtended);
    
    const politiciansWithExtended = await Promise.all(
      politicians.map(async (politician) => {
        const extended = await extendedRepo.findOne({ 
          where: { userId: politician.id },
        });
        
        if (extended) {
          return {
            ...politician,
            party: extended.party || politician.supportedPartyId,
            district: extended.district,
            // 拡張プロフィールの画像を優先
            profileImageUrl: extended.profileImageUrl || politician.profileImageUrl,
            // 拡張プロフィールの名前を優先
            name: extended.name || politician.name || politician.username,
          };
        }
        
        return politician;
      })
    );
    
    return politiciansWithExtended;
  }

  async getFollowerCount(targetUserId: string): Promise<number> {
    return this.follows.count({ where: { targetUserId } });
  }

  async isFollowing(followerUserId: string, targetUserId: string): Promise<boolean> {
    const existing = await this.follows.findOne({ where: { followerUserId, targetUserId } });
    return !!existing;
  }
}