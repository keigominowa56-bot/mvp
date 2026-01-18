import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  politicianId!: string;

  @Column({ type: 'varchar', length: 256 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  category!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: string;

  @Index()
  @Column({ type: 'datetime', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}