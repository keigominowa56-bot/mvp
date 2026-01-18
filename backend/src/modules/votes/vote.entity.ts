import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  type: 'support' | 'oppose';

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}