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
import { User } from 'src/entities/user.entity';
import { ActivityFund } from 'src/entities/activity-fund.entity';
import { ActivityLog } from 'src/entities/activity-log.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // UsersService/MembersService が参照する基本プロフィール
  @Index()
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 256, nullable: true })
  email!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  twitterHandle!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastTwitterFetch!: Date | null;

  // 所属や権限など必要に応じて
  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  role!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  groupId!: string | null;

  // ユーザーとの関連
  @ManyToOne(() => User, (user) => user.members, { onDelete: 'CASCADE' })
  user!: User;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  // 活動資金（ActivityFund）との関連
  @OneToMany(() => ActivityFund, (fund) => fund.member)
  activityFunds!: ActivityFund[];

  // 活動ログ（ActivityLog）との関連
  @OneToMany(() => ActivityLog, (log) => log.member)
  activityLogs!: ActivityLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}