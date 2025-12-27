import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Politician } from 'src/entities/politician.entity';
import { Member } from 'src/entities/member.entity';

@Entity('funding_records')
export class FundingRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  politicianId!: string;

  @ManyToOne(() => Politician, (p) => p.id, { onDelete: 'CASCADE' })
  politician!: Politician;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  memberId!: string | null;

  @ManyToOne(() => Member, (m) => m.id, { onDelete: 'SET NULL', nullable: true })
  member!: Member | null;

  // 金額
  @Column({ type: 'int' })
  amount!: number;

  // 区分（寄付、支出など）
  @Column({ type: 'varchar', length: 64 })
  category!: string;

  // 会計年度（必要なら）
  @Index()
  @Column({ type: 'int', nullable: true })
  fiscalYear!: number | null;

  // 日付（費用発生日など）
  @Index()
  @Column({ type: 'date', nullable: true })
  expenseDate!: Date | null;

  // 備考
  @Column({ type: 'varchar', length: 256, nullable: true })
  note!: string | null;

  // 作成日時（PostgreSQL対応: datetimeではなくtimestamp with time zone）
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  // 更新日時
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}