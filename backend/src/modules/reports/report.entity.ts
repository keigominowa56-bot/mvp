import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string;              // 通報対象 (comment/post 等の ID)

  @Column({ type: 'varchar' })
  targetType: 'comment' | 'post' | 'other';

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @Column({ nullable: true })
  moderatorId?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}