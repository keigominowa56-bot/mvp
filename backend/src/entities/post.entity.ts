import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Region } from './region.entity';
import { PostType } from '../enums/post-type.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  authorUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @Column({ length: 256 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  // 画像/動画のメディアID（UUID）の配列
  @Column({ type: 'json', nullable: true })
  mediaIds: string[] | null;

  // 地域紐付け（任意）
  @Column({ nullable: true })
  regionId: string | null;

  @ManyToOne(() => Region, { nullable: true })
  region?: Region | null;

  @CreateDateColumn()
  createdAt: Date;
}