// backend/src/entities/member.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { User } from './user.entity';
import { ActivityFund } from './activity-fund.entity';
import { Pledge } from './pledge.entity';
import { Vote } from './vote.entity'; 

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 }) // 修正
  name: string;

  @Column({ name: 'twitter_handle', type: 'varchar', length: 255, nullable: true })
  twitterHandle: string | null;

  // 🚨 修正: type: 'varchar' を明示的に指定 (email)
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  // 🚨 修正: type: 'varchar' を明示的に指定 (affiliation)
  @Column({ type: 'varchar', length: 255, nullable: true })
  affiliation: string | null;
  
  // 🚨 修正: type: 'varchar' を明示的に指定 (position)
  @Column({ type: 'varchar', length: 255, nullable: true })
  position: string | null;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  // 🚨 修正: type: 'text' を明示的に指定 (blogRssUrl)
  @Column({ name: 'blog_rss_url', type: 'text', nullable: true })
  blogRssUrl: string | null;

  // 🚨 修正: type: 'text' を明示的に指定 (officialRssUrl)
  @Column({ name: 'official_rss_url', type: 'text', nullable: true })
  officialRssUrl: string | null;

  @Column({ name: 'last_twitter_fetch', type: 'datetime', nullable: true })
  lastTwitterFetch: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.member)
  activityLogs: ActivityLog[];

  @ManyToOne(() => User, (user) => user.members)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ActivityFund, (activityFund) => activityFund.member)
  activityFunds: ActivityFund[];

  @OneToMany(() => Pledge, (pledge) => pledge.member)
  pledges: Pledge[];
  
  @OneToMany(() => Vote, (vote) => vote.member)
  votes: Vote[];
}