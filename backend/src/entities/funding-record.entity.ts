import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('funding_records')
@Index(['politicianId'])
@Index(['politicianId', 'date'])
export class FundingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  politicianId: string;

  @Column({ type: 'int' })
  amount: number; // 円

  @Column({ type: 'varchar', nullable: true })
  category?: string; // 例: 広告費など

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}