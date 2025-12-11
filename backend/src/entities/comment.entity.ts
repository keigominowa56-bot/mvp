import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

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

  // コメントのメディア（画像/動画）ID（UUID）の配列
  @Column({ type: 'json', nullable: true })
  mediaIds: string[] | null;

  // @nickname を解析してユーザーID配列に解決した結果を保持（通知連動）
  @Column({ type: 'json', nullable: true })
  mentions: string[] | null;

  @CreateDateColumn()
  createdAt: Date;
}