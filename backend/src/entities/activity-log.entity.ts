// backend/src/entities/activity-log.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';
import { ActivityLogType } from '../enums/activity-log-type.enum.js';

@Entity('activity_logs')
export class ActivityLog { 
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'member_id' })
  memberId: string;

  @ManyToOne(() => Member, (member) => member.activityLogs)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({
    type: 'enum',
    enum: ActivityLogType,
    name: 'source',
  })
  source: ActivityLogType;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // 🚨 修正: MySQLがサポートする 'datetime' 型に変更
  // 'timestamp with time zone' は PostgreSQL などの DB のみサポート
  @Column({ name: 'published_at', type: 'datetime' }) 
  publishedAt: Date;

  // 🚨 修正: MySQL互換の 'timestamp' 型に変更
  @Column({ 
    name: 'created_at', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    // onUpdateプロパティはMySQLのTIMESTAMPでのみ有効
  })
  createdAt: Date;

  // 🚨 修正: MySQL互換の 'timestamp' 型に変更し、更新時に自動更新を設定
  @Column({ 
    name: 'updated_at', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP', // データの更新時に自動的に時刻を更新
  })
  updatedAt: Date;
}