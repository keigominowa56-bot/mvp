import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('pledges')
export class Pledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  memberId: string;

  @Column('int')
  amount: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'open' })
  status: string;

  @Column({ type: 'int', default: 0 })
  supportCount: number;

  @Column({ type: 'int', default: 0 })
  voteCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}