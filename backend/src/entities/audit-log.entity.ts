import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  actorUserId: string | null;

  @Index()
  @Column({ length: 64 })
  action: string; // 例: 'vote.cast', 'wallet.reward', 'comment.create'

  @Column({ length: 64, nullable: true })
  targetType: string | null; // 'post' | 'comment' | 'survey' | 'transaction' 等

  @Index()
  @Column({ nullable: true })
  targetId: string | null;

  @Column({ type: 'json', nullable: true })
  meta: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}