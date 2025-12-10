import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_mentions')
@Index(['commentId', 'mentionedUserId'], { unique: true })
export class CommentMention {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  commentId: number;

  @ManyToOne(() => Comment, (c) => c.mentions, { onDelete: 'CASCADE' })
  comment: Comment;

  @Index()
  @Column()
  mentionedUserId: number;

  // User 参照は暫定的に外します
  // @ManyToOne(() => User, { onDelete: 'CASCADE' })
  // mentionedUser: User;

  @CreateDateColumn()
  createdAt: Date;
}