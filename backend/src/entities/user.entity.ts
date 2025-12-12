import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Region } from './region.entity';
import { Party } from './party.entity';
import type { UserRole } from '../enums/user-role.enum';
import type { KycStatus } from '../enums/kyc-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) @Column({ unique: true }) email: string;
  @Index({ unique: true }) @Column({ unique: true }) phone: string;

  @Column() passwordHash: string;

  @Column() name: string;

  @Index({ unique: true }) @Column({ unique: true }) nickname: string;

  @Column({ type: 'varchar', length: 32, default: 'user' })
  role: UserRole;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  kycStatus: KycStatus;

  @Column({ type: 'varchar', length: 32, nullable: true })
  ageGroup?: string;

  @Column({ type: 'int', nullable: true })
  age?: number; // optional (admin UI compatibility if needed)

  @Column({ nullable: true }) regionId?: string;
  @ManyToOne(() => Region, { nullable: true }) region?: Region | null;

  @Column({ nullable: true }) supportedPartyId?: string;
  @ManyToOne(() => Party, { nullable: true }) supportedParty?: Party | null;

  @Column({ nullable: true }) planTier?: string;
  @Column({ nullable: true }) addressPref?: string;
  @Column({ nullable: true }) addressCity?: string;
  @Column({ nullable: true }) emailVerifyToken?: string | null;
  @Column({ default: false }) emailVerified?: boolean;
  @Column({ nullable: true }) phoneNumber?: string;
  @Column({ nullable: true }) phoneVerifyCode?: string | null;
  @Column({ default: false }) phoneVerified?: boolean;
  @Column({ type: 'varchar', length: 16, default: 'active' }) status?: 'active' | 'banned';

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  // Optional relation placeholder: align with real Member entity if exists
  @OneToMany(() => Object as any, () => ({}))
  members?: any[];
}