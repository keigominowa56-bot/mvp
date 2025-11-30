import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('scheduled_posts')
@Index(['status'])
@Index(['scheduledAt'])
export class ScheduledPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorId: string; // politicianId または運営（operator@example.com）

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  @Column({ type: 'datetime' })
  scheduledAt: Date;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: 'scheduled' | 'posted' | 'canceled' | 'failed';

  @Column({ type: 'varchar', nullable: true })
  postedPostId?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}