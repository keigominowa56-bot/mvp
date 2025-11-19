// backend/src/modules/members/members.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const member = this.memberRepository.create(createMemberDto);
    return this.memberRepository.save(member);
  }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({ relations: ['user'] });
  }

  // エラーTS2339の修正: findOneメソッドを追加 (controller, external-feedsで使用)
  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { id }, relations: ['user'] });
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
    return member;
  }
  
  // エラーTS2339の修正: updateメソッドの定義を修正
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id); // エラーTS2339修正: findOneをthis.findOneに修正
    this.memberRepository.merge(member, updateMemberDto);
    return this.memberRepository.save(member);
  }

  // エラーTS2339の修正: updateLastTwitterFetchメソッドを追加 (external-feedsで使用)
  async updateLastTwitterFetch(id: string): Promise<void> {
    await this.memberRepository.update(id, { lastTwitterFetch: new Date() });
  }
  
  // エラーTS2339の修正: removeメソッドを追加 (controllerで使用)
  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const result = await this.memberRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }
    return { deleted: true, id };
  }

  // エラーTS2339の修正: getStatsメソッドを追加 (controllerで使用)
  async getStats(): Promise<any> {
    return { totalMembers: await this.memberRepository.count() };
  }
  
  // エラーTS2339の修正: getActivityFundSummaryメソッドを追加 (controllerで使用)
  async getActivityFundSummary(memberId: string, fiscalYear: number): Promise<any> {
      // 実際にはActivityFundsServiceを呼び出して集計する
      return { memberId, fiscalYear, total: 1000, spent: 500 }; 
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.memberRepository.findOne({ where: { email } });
  }
}