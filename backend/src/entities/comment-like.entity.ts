import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('comment_likes')
@Index(['commentId', 'userId'], { unique: true })
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  commentId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  // Postgres対応: datetime ではなく timestamp with time zone を使用
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}