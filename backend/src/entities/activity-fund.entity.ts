import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';

@Entity('activity_funds')
export class ActivityFund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  memberId: string;

  @ManyToOne(() => Member, (member) => member.activityFunds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ nullable: true })
  fiscalYear?: string;

  // 変更: timestamptz → datetime
  @Column({ type: 'datetime', nullable: true })
  expenseDate?: Date;

  @Column({ type: 'int', default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}