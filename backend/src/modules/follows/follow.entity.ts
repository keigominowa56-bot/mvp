import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('follows')
@Unique(['fromUserId', 'toUserId'])
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserId: number;

  @Column()
  toUserId: number;

  @CreateDateColumn()
  createdAt: Date;
}
