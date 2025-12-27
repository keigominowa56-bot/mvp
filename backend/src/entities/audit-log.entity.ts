import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  actorUserId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  targetType!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  targetId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  message!: string | null;

  @Column({ type: 'json', nullable: true })
  meta!: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}