import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('posts')
@Index(['authorId'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  authorId?: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  // 地域タグ（簡易版）
  @Column({ type: 'varchar', nullable: true })
  regionPref?: string;

  @Column({ type: 'varchar', nullable: true })
  regionCity?: string;

  @Column({ type: 'boolean', default: false })
  hidden: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}