// backend/src/modules/activity-funds/activity-funds.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityFund } from '../../entities/activity-fund.entity';
import { CreateActivityFundDto } from './dto/create-activity-fund.dto';
import { UpdateActivityFundDto } from './dto/update-activity-fund.dto'; 

@Injectable()
export class ActivityFundsService {
  constructor(
    @InjectRepository(ActivityFund)
    private activityFundRepository: Repository<ActivityFund>,
  ) {}

  // 🚨 修正: 戻り値の型を Promise<ActivityFund> と明示
  async create(createActivityFundDto: CreateActivityFundDto): Promise<ActivityFund> {
    const activityFund = this.activityFundRepository.create(createActivityFundDto as any); 
    
    // 🚨 最終修正: 二重アサーションで型を強制上書き
    return this.activityFundRepository.save(activityFund) as unknown as ActivityFund; 
  }

  async findAll(): Promise<ActivityFund[]> {
    return this.activityFundRepository.find({ 
      relations: ['member'],
      order: { fiscalYear: 'DESC', expenseDate: 'DESC' }, 
    });
  }

  async findOne(id: string): Promise<ActivityFund> {
    const fund = await this.activityFundRepository.findOne({ where: { id }, relations: ['member'] });
    if (!fund) {
      throw new NotFoundException(`ActivityFund with ID "${id}" not found`);
    }
    return fund;
  }
  
  async update(id: string, updateActivityFundDto: UpdateActivityFundDto): Promise<ActivityFund> {
    const fund = await this.findOne(id);
    this.activityFundRepository.merge(fund, updateActivityFundDto);
    return this.activityFundRepository.save(fund);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const result = await this.activityFundRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ActivityFund with ID "${id}" not found`);
    }
    return { deleted: true, id };
  }
  
  async importFromCsv(csvData: any[], memberId: string): Promise<{ importedCount: number }> {
    console.log(`Importing funds for member ${memberId}. CSV rows: ${csvData.length}`);
    return { importedCount: 0 }; 
  }

  async getStats(): Promise<any> {
    return { totalFunds: await this.activityFundRepository.count(), totalAmount: 0 };
  }

  async getCategorySummary(memberId: string, fiscalYear?: number): Promise<any> {
    return { memberId, fiscalYear, summary: [] };
  }
  
  async findByMember(memberId: string, fiscalYear?: number): Promise<ActivityFund[]> {
    const where: any = { memberId };
    if (fiscalYear) {
      where.fiscalYear = fiscalYear;
    }
    return this.activityFundRepository.find({ 
      where, 
      relations: ['member'],
      order: { fiscalYear: 'DESC', expenseDate: 'DESC' },
    });
  }
}