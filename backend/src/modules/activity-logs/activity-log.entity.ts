import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 何をしたか
  @Column()
  action: string;

  // 行った人 (ユーザーID)
  @Column()
  actorId: string;

  // メンバーID (必要な場面があるなら)
  @Column({ nullable: true })
  memberId?: string;

  // 外部サービスの ID (ツイートなど)
  @Index()
  @Column({ nullable: true })
  externalId?: string;

  // その他の追加データ
  @Column({ nullable: true, type: 'text' })
  metadata?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}