import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('reactions')
@Unique(['userId', 'targetType', 'targetId', 'type'])
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
