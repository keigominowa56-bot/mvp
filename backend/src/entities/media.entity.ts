import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/entities/user.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 所有者（アップロードしたユーザー）
  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId!: string | null;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'SET NULL', nullable: true })
  owner!: User | null;

  // カテゴリ（例: avatar, post, document など）
  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  category!: string | null;

  // メディアタイプ（例: image, video, document）
  @Index()
  @Column({ type: 'varchar', length: 64 })
  type!: string;

  // ストレージ上の保存パス
  @Index()
  @Column({ type: 'varchar', length: 256 })
  path!: string;

  // アップロード元のファイル名
  @Column({ type: 'varchar', length: 256, nullable: true })
  originalName!: string | null;

  // バイトサイズ
  @Column({ type: 'int', nullable: true })
  sizeBytes!: number | null;

  // MIMEタイプ
  @Column({ type: 'varchar', length: 128, nullable: true })
  mimeType!: string | null;

  // 任意メタデータ
  @Column({ type: 'jsonb', nullable: true })
  meta!: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}