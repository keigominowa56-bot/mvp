import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('reports')
@Unique(['reporterId', 'targetType', 'targetId'])
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number;

  @Column()
  targetType: string; // 'post' | 'comment' | 追加対象

  @Column()
  targetId: number;

  @Column()
  reason: string;

  @Column({ default: 'open' })
  status: string; // open | resolved

  @Column({ type: 'varchar', nullable: true })
  adminAction: string | null; // hide | ignore 等

  @CreateDateColumn()
  createdAt: Date;
}