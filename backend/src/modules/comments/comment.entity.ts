import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('comments')
@Index(['postId'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @Column({ nullable: true })
  authorId?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  hidden: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}