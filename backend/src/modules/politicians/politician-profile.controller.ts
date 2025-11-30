import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Follow } from '../follows/follow.entity';
import { Post } from '../posts/post.entity';
import { Policy } from '../../entities/policy.entity';
import { FundingRecord } from '../../entities/funding-record.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('politicians')
@UseGuards(JwtAuthGuard)
export class PoliticianProfileController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Policy) private readonly policyRepo: Repository<Policy>,
    @InjectRepository(FundingRecord) private readonly fundingRepo: Repository<FundingRecord>,
  ) {}

  @Get(':id/profile')
  async profile(@Param('id') id: string) {
    const u = await this.userRepo.findOne({ where: { id } });
    if (!u || u.role !== 'politician') return { error: 'not politician' };

    const followerCount = await this.followRepo.count({ where: { politicianId: id } });
    const posts = await this.postRepo.find({ where: { authorId: id, hidden: false }, order: { createdAt: 'DESC' }, take: 10 });
    const policies = await this.policyRepo.find({ where: { politicianId: id }, order: { createdAt: 'DESC' } });
    const fundRecords = await this.fundingRepo.find({ where: { politicianId: id }, order: { date: 'DESC' }, take: 20 });

    const fundingSummary: Record<string, number> = {};
    let fundingTotal = 0;
    for (const r of fundRecords) {
      const cat = r.category || 'その他';
      fundingSummary[cat] = (fundingSummary[cat] || 0) + r.amount;
      fundingTotal += r.amount;
    }

    return {
      id: u.id,
      name: u.name,
      kana: u.kana,
      party: u.party,
      constituency: u.constituency,
      termCount: u.termCount,
      xHandle: u.xHandle,
      instagramHandle: u.instagramHandle,
      facebookUrl: u.facebookUrl,
      youtubeUrl: u.youtubeUrl,
      websiteUrl: u.websiteUrl,
      followerCount,
      posts,
      policies,
      funding: { total: fundingTotal, summary: fundingSummary },
    };
  }
}