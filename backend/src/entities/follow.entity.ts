import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique('UQ_follow_pair', ['followerUserId', 'targetUserId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  followerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  follower: User;

  @Index()
  @Column()
  targetUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  target: User;

  @CreateDateColumn()
  createdAt: Date;
}