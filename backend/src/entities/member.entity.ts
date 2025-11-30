import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ActivityLog } from '../modules/activity-logs/activity-log.entity';
import { ActivityFund } from './activity-fund.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  twitterHandle?: string;

  @Column({ nullable: true })
  lastTwitterFetch?: Date;

  @ManyToOne(() => User, (user) => user.members, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @OneToMany(() => ActivityLog, (log) => log.member)
  activityLogs: ActivityLog[];

  @OneToMany(() => ActivityFund, (fund) => fund.member)
  activityFunds: ActivityFund[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}