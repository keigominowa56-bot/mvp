import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';

@Entity('scheduled_posts')
export class ScheduledPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 投稿元の下書きや関連postIdがある場合（任意）
  @Index()
  @Column({ type: 'uuid', nullable: true })
  postId!: string | null;

  @ManyToOne(() => Post, (post) => post.id, { onDelete: 'CASCADE', nullable: true })
  post!: Post | null;

  // 作成ユーザー（service は authorId を使用している）
  @Index()
  @Column({ type: 'uuid' })
  authorId!: string;

  // 既存の authorUserId を使用する実装がある場合の互換用（任意）
  @Index()
  @Column({ type: 'uuid', nullable: true })
  authorUserId!: string | null;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  author!: User;

  // 投稿日時（PostgreSQLでは datetime ではなく timestamp 系を使用）
  @Index()
  @Column({ type: 'timestamp' })
  scheduledAt!: Date;

  // 投稿内容関連
  @Column({ type: 'varchar', length: 256 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'json', nullable: true })
  tags!: string[] | null;

  // 投稿後の状態管理
  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  postedPostId!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  failureReason!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}