import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('policies')
@Index(['politicianId'])
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  politicianId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'in-progress' | 'achieved' | 'abandoned';

  @Column({ type: 'datetime', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}