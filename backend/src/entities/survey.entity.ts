import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json' })
  questions: Array<{ id: string; type: 'single' | 'multi' | 'text'; text: string; options?: string[] }>;

  // 配信対象の条件（簡易JSON）
  @Column({ type: 'json', nullable: true })
  targetCriteria: { regionIds?: string[]; ageGroups?: string[]; partyIds?: string[] } | null;

  @Column({ type: 'timestamptz', nullable: true })
  startAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}