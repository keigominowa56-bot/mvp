import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';

export type CommentReactionType = 'agree';

@Entity('comment_reactions')
@Index(['commentId', 'userId', 'type'], { unique: true })
export class CommentReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  commentId: number;

  @ManyToOne(() => Comment, (c) => c.reactions, { onDelete: 'CASCADE' })
  comment: Comment;

  @Index()
  @Column()
  userId: number;

  // User 参照は暫定的に外します
  // @ManyToOne(() => User, { onDelete: 'CASCADE' })
  // user: User;

  @Index()
  @Column({ type: 'varchar', length: 16 })
  type: CommentReactionType;

  @CreateDateColumn()
  createdAt: Date;
}