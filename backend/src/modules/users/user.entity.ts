// backend/src/modules/users/user.entity.ts (全体コード)

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../posts/post.entity'; // Post エンティティのインポートを仮定

// 役割（Role）の定義をエンティティの前に配置します
export enum UserRole {
  CITIZEN = 'citizen',
  POLITICIAN = 'politician',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string; // 既存のフィールド（例として追加）

  @Column()
  name: string; // 既存のフィールド（例として追加）
  
  // ... その他の既存のフィールド ...

  // 👇 ここから追加/変更 👇
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN, // デフォルトは一般市民
  })
  role: UserRole; // 👈 役割を保持するフィールド
  // 👆 ここまで追加/変更 👆

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}