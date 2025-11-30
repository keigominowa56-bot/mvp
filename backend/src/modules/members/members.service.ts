import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Member } from '../../entities/member.entity';

interface CreateMemberDto {
  name: string;
  email?: string;
  twitterHandle?: string;
  userId?: string;
}

interface UpdateMemberDto {
  name?: string;
  email?: string;
  twitterHandle?: string;
  lastTwitterFetch?: Date;
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(dto: CreateMemberDto) {
    const member = this.memberRepository.create({
      name: dto.name,
      email: dto.email,
      twitterHandle: dto.twitterHandle,
    });
    return this.memberRepository.save(member);
  }

  async findAll() {
    return this.memberRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const m = await this.memberRepository.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Member not found');
    return m;
  }

  async findByEmail(email: string) {
    if (!email) return null;
    return this.memberRepository.findOne({ where: { email } as FindOptionsWhere<Member> });
  }

  async update(id: string, dto: UpdateMemberDto) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');

    if (dto.name) member.name = dto.name;
    if (dto.email !== undefined) member.email = dto.email;
    if (dto.twitterHandle !== undefined) member.twitterHandle = dto.twitterHandle;
    if (dto.lastTwitterFetch !== undefined) member.lastTwitterFetch = dto.lastTwitterFetch;

    return this.memberRepository.save(member);
  }

  async updateLastTwitterFetch(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    member.lastTwitterFetch = new Date();
    return this.memberRepository.save(member);
  }

  async remove(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    await this.memberRepository.remove(member);
    return { deleted: true };
  }

  async getStats() {
    const total = await this.memberRepository.count();
    return { total };
  }

  async getActivityFundSummary(memberId: string, fiscalYear?: string | number) {
    // ここでは stub (ActivityFund 集計未実装)
    return {
      memberId,
      fiscalYear: fiscalYear ? String(fiscalYear) : 'unknown',
      totalAmount: 0,
      funds: [],
    };
  }
}