import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Member } from './member.entity';

@Entity('users')
@Index(['role'])
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', default: 'user' })
  role: 'admin' | 'politician' | 'user';

  // Account status (ban etc.)
  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'banned';

  // Verification
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerifyToken?: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  phoneVerifyCode?: string;

  // Profile
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  kana?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ nullable: true })
  addressPref?: string;

  @Column({ nullable: true })
  addressCity?: string;

  // Politician related
  @Column({ type: 'varchar', nullable: true })
  party?: string;

  @Column({ type: 'varchar', nullable: true })
  caucus?: string;

  @Column({ type: 'varchar', nullable: true })
  constituency?: string;

  @Column({ type: 'int', nullable: true })
  termCount?: number;

  // Social links
  @Column({ type: 'varchar', nullable: true })
  xHandle?: string;

  @Column({ type: 'varchar', nullable: true })
  instagramHandle?: string;

  @Column({ type: 'varchar', nullable: true })
  facebookUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  youtubeUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  websiteUrl?: string;

  // Biography (long text)
  @Column({ type: 'text', nullable: true })
  biography?: string;

  // KYC / Plan
  @Column({ nullable: true })
  governmentIdUrl?: string;

  @Column({ type: 'varchar', default: 'verified' })
  kycStatus: 'pending' | 'verified' | 'rejected';

  @Column({ type: 'varchar', default: 'free' })
  planTier: 'free' | 'pro';

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}