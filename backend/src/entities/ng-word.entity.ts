import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ng_words')
export class NgWord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  word: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}