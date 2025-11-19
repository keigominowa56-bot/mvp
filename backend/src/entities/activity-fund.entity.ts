// backend/src/entities/activity-fund.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';

@Entity('activity_funds')
export class ActivityFund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column()
  amount: number;

  @Column({ name: 'fiscal_year', type: 'int' }) 
  fiscalYear: number;
  
  // 🚨 修正: 'timestamp with time zone' -> 'datetime'
  @Column({ name: 'expense_date', type: 'datetime' }) 
  expenseDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;
  
  // 🚨 修正: 'timestamp with time zone' -> 'datetime'
  @Column({ name: 'funded_at', type: 'datetime', nullable: true })
  fundedAt: Date | null;
  
  // 🚨 修正: 'timestamp with time zone' -> 'timestamp'
  @Column({ 
    name: 'created_at', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  createdAt: Date;

  // 🚨 修正: 'timestamp with time zone' -> 'timestamp' (自動更新設定付き)
  @Column({ 
    name: 'updated_at', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Member, (member) => member.activityFunds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;
}