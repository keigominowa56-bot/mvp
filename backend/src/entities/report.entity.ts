import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'rejected' | 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportTargetType = 'user' | 'post' | 'comment';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  reporterId!: string;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  targetType!: ReportTargetType;

  @Index()
  @Column({ type: 'uuid' })
  targetId!: string;

  @Column({ type: 'varchar', length: 64 })
  type!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  reasonCategory!: string | null;

  @Column({ type: 'text', nullable: true })
  reasonText!: string | null;

  @Column({ type: 'json', nullable: true })
  data!: Record<string, any> | null;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: ReportStatus;

  @Column({ type: 'varchar', length: 512, nullable: true })
  adminNote!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}