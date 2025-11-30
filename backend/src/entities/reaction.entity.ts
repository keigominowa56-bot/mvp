import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('reactions')
@Index(['targetId', 'userId'], { unique: true })
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  type: 'like' | 'agree' | 'disagree';

  @CreateDateColumn()
  createdAt: Date;
}