// backend/src/entities/pledge.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Member } from './member.entity';
import { Vote } from './vote.entity'; 

@Entity('pledges')
export class Pledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column()
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Column({ name: 'status' }) 
  status: string;

  // サービス層の集計用にプロパティを追加
  @Column({ name: 'support_count', type: 'int', default: 0 })
  supportCount: number;

  @Column({ name: 'oppose_count', type: 'int', default: 0 })
  opposeCount: number;

  @Column({ name: 'vote_count', type: 'int', default: 0 })
  voteCount: number;

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

  @ManyToOne(() => Member, (member) => member.pledges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @OneToMany(() => Vote, (vote) => vote.pledge)
  votes: Vote[];
}