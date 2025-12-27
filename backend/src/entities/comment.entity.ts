import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { CommentReaction } from './comment-reaction.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  postId!: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post!: Post;

  @Index()
  @Column({ type: 'uuid' })
  authorUserId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author!: User;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'json', nullable: true })
  mediaIds!: string[] | null;

  @Column({ type: 'json', nullable: true })
  mentions!: string[] | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Comment, (comment) => comment.children, { onDelete: 'CASCADE', nullable: true })
  parent!: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children!: Comment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @OneToMany(() => CommentReaction, (r) => r.comment)
  reactions!: CommentReaction[];
}