import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { MediaType } from '../enums/media-type.enum';
import { MediaCategory } from '../enums/media-category.enum';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  ownerUserId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  owner?: User | null;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column({ type: 'enum', enum: MediaCategory })
  category: MediaCategory;

  @Column({ length: 2048 })
  url: string;

  @Column({ length: 256, nullable: true })
  originalName: string | null;

  @Column({ length: 128, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  size: number | null;

  @CreateDateColumn()
  createdAt: Date;
}