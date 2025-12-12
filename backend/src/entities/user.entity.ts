import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Region } from './region.entity';
import { Party } from './party.entity';
import { UserRole } from '../enums/user-role.enum';
import { KycStatus } from '../enums/kyc-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) @Column({ unique: true }) email: string;
  @Index({ unique: true }) @Column({ unique: true }) phone: string;
  @Column() passwordHash: string;
  @Column() name: string;
  @Index({ unique: true }) @Column({ unique: true }) nickname: string;

  @ManyToOne(() => Region, { nullable: true }) region?: Region | null;
  @ManyToOne(() => Party, { nullable: true }) supportedParty?: Party | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CITIZEN }) role: UserRole;
  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.NONE }) kycStatus: KycStatus;

  // 追加フィールド（参照整合）
  @Column({ nullable: true }) planTier?: string;
  @Column({ nullable: true, type: 'int' }) age?: number;
  @Column({ nullable: true }) addressPref?: string;
  @Column({ nullable: true }) addressCity?: string;
  @Column({ nullable: true }) emailVerifyToken?: string | null;
  @Column({ default: false }) emailVerified?: boolean;
  @Column({ nullable: true }) phoneNumber?: string;
  @Column({ nullable: true }) phoneVerifyCode?: string | null;
  @Column({ default: false }) phoneVerified?: boolean;
  @Column({ type: 'enum', enum: ['active', 'banned'], default: 'active' }) status?: 'active' | 'banned';

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}