import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { VoteChoice } from '../enums/vote-choice.enum';

@Entity('votes')
@Unique('UQ_vote_post_voter', ['postId', 'voterUserId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Index()
  @Column()
  voterUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  voter: User;

  @Column({ type: 'enum', enum: VoteChoice })
  choice: VoteChoice;

  @CreateDateColumn()
  createdAt: Date;
}