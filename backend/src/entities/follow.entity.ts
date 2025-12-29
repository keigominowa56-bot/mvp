import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique('UQ_follow_pair', ['followerUserId', 'targetUserId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  followerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  follower: User;

  @Index()
  @Column({ type: 'uuid' })
  targetUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  target: User;

  @CreateDateColumn()
  createdAt: Date;
}