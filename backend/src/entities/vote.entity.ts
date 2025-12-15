import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Post } from 'src/entities/post.entity';

export enum VoteChoice {
  AGREE = 'agree',
  DISAGREE = 'disagree',
}

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  postId!: string;

  @Index()
  @Column({ type: 'uuid' })
  voterUserId!: string;

  @Column({ type: 'enum', enum: VoteChoice })
  choice!: VoteChoice;

  @ManyToOne(() => User, (user) => user.votes)
  user!: User;

  @ManyToOne(() => Post, (post) => post.votes)
  post!: Post;
}