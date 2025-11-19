// backend/src/entities/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Member } from './member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TypeORMはデフォルトでstringをvarcharと解釈するため、通常問題なし
  @Column({ unique: true })
  email: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName: string | null;

  // TypeORMはデフォルトでstringをvarcharと解釈するため、通常問題なし
  @Column({ nullable: true })
  role: string; // 'admin', 'user' など

  @Column({ name: 'firebase_uid', type: 'varchar', length: 255, unique: true, nullable: true })
  firebaseUid: string | null;

  // 🚨 修正: photoUrl に 'varchar' 型を明示的に指定
  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null; 

  // 🚨 念のため district も 'varchar' 型を明示的に指定
  @Column({ type: 'varchar', length: 255, nullable: true })
  district: string | null; 
  
  // MySQLでの 'tinyint(1)' 互換のため 'boolean' ではなく 'tinyint' を推奨します。
  // TypeORMのデフォルトのbooleanマッピング（tinyint）を信用するか、明示的に tinyint を指定します。
  @Column({ name: 'is_active', type: 'tinyint', default: 1 }) // tinyint(1) に対応
  isActive: boolean;

  // 🚨 修正: TIMESTAMP(6) のエラーを回避するため、型を 'datetime' に変更
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  // 🚨 修正: TIMESTAMP(6) のエラーを回避するため、型を 'datetime' に変更
  // datetime 型の場合、TypeORM が onUpdate: 'CURRENT_TIMESTAMP' を適切に処理することを期待
  @UpdateDateColumn({ 
    name: 'updated_at', 
    type: 'datetime',
  })
  updatedAt: Date;

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];
}