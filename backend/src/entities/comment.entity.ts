import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { CommentReaction } from './comment-reaction.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Index()
  @Column()
  authorUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  mediaIds: string[] | null;

  @Column({ type: 'json', nullable: true })
  mentions: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CommentReaction, (r) => r.comment)
  reactions: CommentReaction[];
}