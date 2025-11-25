import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pledge } from './pledge.entity';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';

@Injectable()
export class PledgesService {
  constructor(
    @InjectRepository(Pledge)
    private readonly repo: Repository<Pledge>,
  ) {}

  async create(dto: CreatePledgeDto) {
    const pledge = this.repo.create({
      memberId: dto.memberId,
      amount: dto.amount,
      description: dto.description,
      status: dto.status || 'open',
    });
    return this.repo.save(pledge);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const pledge = await this.repo.findOne({ where: { id } });
    if (!pledge) throw new NotFoundException('Pledge not found');
    return pledge;
  }

  async update(id: string, dto: UpdatePledgeDto) {
    const pledge = await this.findOne(id);
    Object.assign(pledge, dto);
    return this.repo.save(pledge);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const pledge = await this.findOne(id);
    await this.repo.remove(pledge);
    return { deleted: true, id };
  }

  // 追加メソッド（コントローラ・Votes などが利用）
  async getStats() {
    const total = await this.repo.count();
    const open = await this.repo.count({ where: { status: 'open' } });
    const closed = await this.repo.count({ where: { status: 'closed' } });
    return { total, open, closed };
  }

  async findByMember(memberId: string) {
    return this.repo.find({ where: { memberId }, order: { createdAt: 'DESC' } });
  }

  async updateVoteCounts(pledgeId: string) {
    // ここでは単純に voteCount を 1 増やす例。実際は votes テーブルを集計すべき。
    const pledge = await this.findOne(pledgeId);
    pledge.voteCount = (pledge.voteCount || 0) + 1;
    await this.repo.save(pledge);
    return { pledgeId, voteCount: pledge.voteCount };
  }
}