import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from 'src/entities/member.entity';
import { Post } from 'src/entities/post.entity';
import { Vote } from 'src/entities/vote.entity';

export type UserStatus = 'pending' | 'approved' | 'rejected';  // 追加

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 256, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  name!: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128, unique: true, nullable: true })
  nickname!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  ageGroup!: string | null;

  @Column({ type: 'varchar', length: 256 })
  passwordHash!: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 256, select: false, nullable: true })
  emailVerifyToken!: string | null;

  @Column({ type: 'boolean', default: false })
  phoneVerified!: boolean;

  @Column({ type: 'varchar', length: 64, select: false, nullable: true })
  phoneVerifyCode!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: UserStatus;  // ← 型を必ずUserStatus型に

  @Column({ type: 'varchar', length: 32, default: 'citizen' })
  role!: 'admin' | 'politician' | 'citizen';

  @Column({ type: 'varchar', length: 64, nullable: true })
  addressPref!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  addressCity!: string | null;

  @OneToMany(() => Member, (member) => member.user)
  members!: Member[];

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes!: Vote[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}