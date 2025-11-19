// backend/src/modules/votes/votes.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../../entities/vote.entity';
import { PledgesService } from '../pledges/pledges.service';
import { CreateVoteDto } from './dto/create-vote.dto'; // ⬅️ 正式なDTOをインポート

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    private readonly pledgesService: PledgesService,
  ) {}

  // TS2304エラーの修正: 型CreateVoteDtoを正しく使用
  async create(createVoteDto: CreateVoteDto): Promise<Vote> {
    await this.pledgesService.findOne(createVoteDto.pledgeId); 

    const existingVote = await this.voteRepository.findOne({
      where: { 
        pledgeId: createVoteDto.pledgeId, 
        memberId: createVoteDto.memberId 
      },
    });

    if (existingVote) {
      throw new BadRequestException('このメンバーはすでに投票しています。');
    }

    const newVote = this.voteRepository.create({
      pledgeId: createVoteDto.pledgeId,
      memberId: createVoteDto.memberId, 
      voteType: createVoteDto.voteType,
    });

    const savedVote = await this.voteRepository.save(newVote);
    await this.pledgesService.updateVoteCounts(createVoteDto.pledgeId); 

    return savedVote;
  }
  
  async getVoteStats(pledgeId: string): Promise<any> {
    const stats = await this.pledgesService.updateVoteCounts(pledgeId); 
    return { 
        supportCount: stats.supportCount, 
        opposeCount: stats.opposeCount, 
        voteCount: stats.voteCount 
    };
  }

  async findByPledge(pledgeId: string): Promise<Vote[]> {
    return this.voteRepository.find({ where: { pledgeId }, relations: ['member'] });
  }

  async findByUser(memberId: string): Promise<Vote[]> {
      return this.voteRepository.find({ where: { memberId }, relations: ['pledge'] });
  }

  async getUserVote(memberId: string, pledgeId: string): Promise<Vote | null> {
      return this.voteRepository.findOne({ where: { memberId, pledgeId } });
  }

  async update(memberId: string, pledgeId: string, voteType: 'support' | 'oppose'): Promise<Vote> {
      const vote = await this.getUserVote(memberId, pledgeId);
      if (!vote) {
          throw new NotFoundException('投票が見つかりません');
      }
      vote.voteType = voteType;
      const updatedVote = await this.voteRepository.save(vote);
      await this.pledgesService.updateVoteCounts(pledgeId);
      return updatedVote;
  }
  
  async remove(memberId: string, pledgeId: string): Promise<void> {
      const vote = await this.getUserVote(memberId, pledgeId);
      if (!vote) {
          throw new NotFoundException('投票が見つかりません');
      }
      await this.voteRepository.delete(vote.id);
      await this.pledgesService.updateVoteCounts(pledgeId);
  }
}