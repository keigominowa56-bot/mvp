import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_reactions')
@Unique('UQ_comment_user_type', ['commentId', 'userId', 'type'])
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  commentId: string;

  @ManyToOne(() => Comment, (c) => c.reactions, { onDelete: 'CASCADE' })
  comment: Comment;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 32 })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}