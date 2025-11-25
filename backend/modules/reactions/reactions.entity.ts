import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('reactions')
// 1ユーザー1対象で1レコードにする（typeは切り替えで更新）
@Unique(['userId', 'targetType', 'targetId'])
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  targetType: string; // post | comment | pledge | activity_log

  @Column()
  targetId: number;

  @Column()
  type: string; // like | agree | disagree

  @CreateDateColumn()
  createdAt: Date;
}