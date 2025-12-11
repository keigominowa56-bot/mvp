import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Region } from './region.entity';
import { Party } from './party.entity';
import { UserRole } from '../enums/user-role.enum';
import { AgeGroup } from '../enums/age-group.enum';
import { KycStatus } from '../enums/kyc-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Index({ unique: true })
  @Column({ unique: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  nickname: string;

  @Column({ type: 'enum', enum: AgeGroup })
  ageGroup: AgeGroup;

  @ManyToOne(() => Region, { nullable: true })
  region?: Region | null;

  @ManyToOne(() => Party, { nullable: true })
  supportedParty?: Party | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CITIZEN })
  role: UserRole;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.NONE })
  kycStatus: KycStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}