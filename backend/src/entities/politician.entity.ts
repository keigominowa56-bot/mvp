import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('politicians')
export class Politician {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  nickname!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  regionId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  partyId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}