import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pledgeId: string;

  @Column()
  memberId: string;

  @CreateDateColumn()
  createdAt: Date;
}