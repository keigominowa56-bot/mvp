import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Member } from 'src/entities/member.entity';

@Entity('activity_funds')
export class ActivityFund {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  memberId!: string;

  @ManyToOne(() => Member, (member) => member.activityFunds, { onDelete: 'CASCADE' })
  member!: Member;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  note!: string | null;

  // 追加: 会計年度（サービスが order に使用）
  @Index()
  @Column({ type: 'int', nullable: true })
  fiscalYear!: number | null;

  // 追加: 支出日（サービスが order に使用）
  @Index()
  @Column({ type: 'date', nullable: true })
  expenseDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}