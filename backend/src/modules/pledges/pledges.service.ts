// backend/src/modules/pledges/pledges.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pledge } from '../../entities/pledge.entity';
import { CreatePledgeDto } from './dto/create-pledge.dto'; 
import { UpdatePledgeDto } from './dto/update-pledge.dto'; 

@Injectable()
export class PledgesService {
  constructor(
    @InjectRepository(Pledge)
    private pledgeRepository: Repository<Pledge>,
  ) {}

  // 🚨 修正: 戻り値の型を Promise<Pledge> と明示
  async create(createPledgeDto: CreatePledgeDto): Promise<Pledge> {
    const pledge = this.pledgeRepository.create(createPledgeDto as any);
    
    // 🚨 最終修正: 二重アサーションで型を強制上書き
    return this.pledgeRepository.save(pledge) as unknown as Pledge;
  }

  async findAll(): Promise<Pledge[]> {
    return this.pledgeRepository.find({ relations: ['member'] });
  }

  async findOne(id: string): Promise<Pledge> {
    const pledge = await this.pledgeRepository.findOne({ where: { id }, relations: ['member', 'votes'] });
    if (!pledge) {
      throw new NotFoundException(`Pledge with ID "${id}" not found`);
    }
    return pledge;
  }
  
  async update(id: string, updatePledgeDto: UpdatePledgeDto): Promise<Pledge> {
    const pledge = await this.findOne(id);
    this.pledgeRepository.merge(pledge, updatePledgeDto);
    return this.pledgeRepository.save(pledge);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const result = await this.pledgeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pledge with ID "${id}" not found`);
    }
    return { deleted: true, id };
  }

  async getStats(): Promise<any> {
    return { totalPledges: await this.pledgeRepository.count() };
  }

  async findByMember(memberId: string): Promise<Pledge[]> {
    return this.pledgeRepository.find({ where: { memberId }, relations: ['member'] });
  }

  async updateVoteCounts(pledgeId: string): Promise<Pledge> {
    const pledge = await this.pledgeRepository.findOne({ 
        where: { id: pledgeId },
        relations: ['votes']
    });

    if (!pledge) {
      throw new NotFoundException(`Pledge with ID "${pledgeId}" not found`);
    }

    const supportCount = pledge.votes.filter(vote => vote.voteType === 'support').length;
    const opposeCount = pledge.votes.filter(vote => vote.voteType === 'oppose').length;

    pledge.supportCount = supportCount;
    pledge.opposeCount = opposeCount;
    pledge.voteCount = supportCount + opposeCount;
    
    return this.pledgeRepository.save(pledge);
  }
}