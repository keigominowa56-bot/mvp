import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('reports')
@Index(['targetType', 'targetId'])
@Index(['status'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reporterId: string;

  @Column({ type: 'varchar' })
  targetType: 'post' | 'comment' | 'user';

  @Column({ type: 'varchar' })
  targetId: string;

  @Column({ type: 'varchar' })
  reasonCategory: 'abuse' | 'spam' | 'misinfo' | 'other';

  @Column({ type: 'text', nullable: true })
  reasonText?: string;

  @Column({ type: 'varchar', default: 'open' })
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed' | 'actioned';

  @Column({ type: 'text', nullable: true })
  adminNote?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}