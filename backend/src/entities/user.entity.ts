import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { UserRole } from 'src/enums/user-role.enum';
import type { KycStatus } from 'src/enums/kyc-status.enum';
import { Region } from 'src/entities/region.entity';
import { Party } from 'src/entities/party.entity';
import { Member } from 'src/entities/member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email!: string;

  @Index({ unique: true })
  @Column({ unique: true, nullable: true })
  phone!: string | null;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true })
  nickname!: string;

  @Column({ type: 'varchar', length: 32, default: 'user' })
  role!: UserRole;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  kycStatus!: KycStatus;

  @Column({ type: 'varchar', length: 32, nullable: true })
  ageGroup!: string | null;

  @Column({ nullable: true })
  regionId!: string | null;

  @ManyToOne(() => Region, { nullable: true })
  region!: Region | null;

  @Column({ nullable: true })
  supportedPartyId!: string | null;

  @ManyToOne(() => Party, { nullable: true })
  supportedParty!: Party | null;

  // 追加フィールド（コントローラ参照に合わせる）
  @Column({ type: 'varchar', nullable: true })
  emailVerifyToken!: string | null;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phoneVerifyCode!: string | null;

  // Member との関係（member.entity.ts が user.members を参照）
  @OneToMany(() => Member, (member) => member.user)
  members!: Member[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}