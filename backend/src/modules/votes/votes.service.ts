import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { PledgesService } from '../pledges/pledges.service';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly repo: Repository<Vote>,
    private readonly pledgesService: PledgesService,
  ) {}

  async create(dto: CreateVoteDto) {
    // pledge が存在するか確認
    await this.pledgesService.findOne(dto.pledgeId);

    const vote = this.repo.create(dto);
    const saved = await this.repo.save(vote);

    // 投票数更新
    await this.pledgesService.updateVoteCounts(dto.pledgeId);

    return saved;
  }

  async findByPledge(pledgeId: string) {
    return this.repo.find({ where: { pledgeId }, order: { createdAt: 'DESC' } });
  }
}