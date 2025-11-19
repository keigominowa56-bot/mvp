// backend/src/entities/vote.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pledge } from './pledge.entity';
import { Member } from './member.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pledge_id' })
  pledgeId: string;

  @Column({ name: 'member_id' }) 
  memberId: string; 

  @Column({ name: 'vote_type' })
  voteType: 'support' | 'oppose';

  // 🚨 修正: 'timestamp with time zone' -> 'timestamp'
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // 🚨 修正: 'timestamp with time zone' -> 'timestamp' (自動更新設定付き)
  @Column({ 
    name: 'updated_at', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Pledge, (pledge) => pledge.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pledge_id' })
  pledge: Pledge;
  
  @ManyToOne(() => Member, (member) => member.votes)
  @JoinColumn({ name: 'member_id' })
  member: Member; // 投票したメンバー
}