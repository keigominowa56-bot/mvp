import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('politician_profiles_extended')
export class PoliticianProfileExtended {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  profileImageUrl!: string | null; // 顔写真URL

  @Column({ type: 'varchar', length: 255, nullable: true })
  district!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  party!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', nullable: true })
  pledges!: string | null;

  @Column({ type: 'json', nullable: true })
  socialLinks!: Record<string, string> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

