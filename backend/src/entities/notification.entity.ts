import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 逆側(User.notifications)を参照しない形に変更（User側の定義が不要）
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar' })
  type: string; // 'survey' | 'info' | 'reminder'

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'varchar', nullable: true })
  linkUrl?: string;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}