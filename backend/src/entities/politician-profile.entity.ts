import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Party } from './party.entity';

@Entity('politician_profiles')
export class PoliticianProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true, type: 'text' })
  bio: string | null;

  @Column({ nullable: true })
  partyId: string | null;

  @ManyToOne(() => Party, { nullable: true })
  @JoinColumn({ name: 'partyId' })
  party: Party | null;

  @Column({ nullable: true, type: 'int' })
  age: number | null;

  // 公約は簡易にJSONで保持（後で別テーブルへ分離可）
  @Column({ type: 'json', nullable: true })
  pledges: Array<{ title: string; description?: string }> | null;

  @Column({ nullable: true })
  fundingReportUrl: string | null;

  @OneToMany(() => FundingSpendingItem, (item) => item.politicianProfile)
  spendingItems: FundingSpendingItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('funding_spending_items')
export class FundingSpendingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  politicianProfileId: string;

  @ManyToOne(() => PoliticianProfile, (p) => p.spendingItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'politicianProfileId' })
  politicianProfile: PoliticianProfile;

  @Index()
  @Column({ length: 64 })
  category: string; // 例: 'ads', 'events', 'printing', 'travel' など

  @Column({ type: 'int' })
  amount: number; // 円

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;
}