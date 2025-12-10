import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Post } from '../posts/post.entity';
import { UserRole } from '../users/user.entity'; // UserRole enum が別ファイルで定義されている前提

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') // IDはUUIDと仮定
  id: string;

  // 既存のフィールド (email, passwordHash, displayName など)
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  displayName: string;

  // 権限制限機能で追加されたRoleフィールド
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role: UserRole;

  // ⬇️ usernameフィールド（メンション用ハンドル）。全ユーザーで一意、検索用にIndexも付与
  @Index({ unique: true })
  @Column({ unique: true, length: 32 })
  username: string;
  // ⬆️ usernameフィールドを追加

  @Column({ nullable: true })
  addressPrefecture: string;

  @Column({ nullable: true })
  addressCity: string;

  // ... 他のリレーション (postsなど) ...
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}