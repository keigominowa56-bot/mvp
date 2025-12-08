import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @RelationId((post: Post) => post.author)
  authorId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'simple-enum', enum: ['policy', 'activity'], default: 'activity' })
  @Index()
  postCategory: 'policy' | 'activity';

  @Column({ type: 'boolean', default: false })
  hidden: boolean;

  @Column({ type: 'varchar', nullable: true })
  regionPref?: string;

  @Column({ type: 'varchar', nullable: true })
  regionCity?: string;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt?: Date;

  // 論理削除
  @Column({ type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}