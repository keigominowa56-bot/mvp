import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('politician_profiles')
export class PoliticianProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  politicianId!: string;

  // プロフィールの各種文字列項目は varchar で明示
  @Column({ type: 'varchar', length: 256, nullable: true })
  occupation!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  homepageUrl!: string | null;

  // 修正点: Object 型ではなく varchar に変更
  @Column({ type: 'varchar', length: 512, nullable: true })
  fundingReportUrl!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  officeAddress!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  email!: string | null;

  // 自由記述フィールドは text か jsonb を使用
  @Column({ type: 'text', nullable: true })
  biography!: string | null;

  @Column({ type: 'json', nullable: true })
  extra!: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}