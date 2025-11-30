import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('follows')
@Index(['followerId', 'politicianId'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  followerId: string;

  @Column()
  politicianId: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}