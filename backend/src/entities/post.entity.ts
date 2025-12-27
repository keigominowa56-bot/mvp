import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Vote } from 'src/entities/vote.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  authorUserId!: string | null;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'authorUserId', referencedColumnName: 'id' })
  author!: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  votes!: Vote[];

  @Column({ type: 'varchar', length: 256 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  regionId!: string | null;

  @Column({ type: 'json', nullable: true })
  mediaIds!: string[] | null;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  videoUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;
}
