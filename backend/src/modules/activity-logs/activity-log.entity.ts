import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Member } from '../../entities/member.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: string; // e.g. 'post_created' | 'vote_cast' | 'external_feed_import'

  @Column({ type: 'text', nullable: true })
  detail?: string;

  @Column({ type: 'varchar', nullable: true })
  source?: string; // 'twitter', 'manual', etc.

  @Index()
  @Column({ type: 'varchar', nullable: true })
  externalId?: string; // external feed id (tweet id 等)

  @Column({ type: 'datetime', nullable: true })
  publishedAt?: Date; // 外部コンテンツ発生時刻

  @ManyToOne(() => Member, (m) => m.activityLogs, { onDelete: 'CASCADE' })
  member: Member;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}