import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique(['follower', 'followee'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  followee: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}