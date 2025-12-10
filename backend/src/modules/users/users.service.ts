// backend/src/modules/users/users.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm'; // 👈 In をインポート
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.users.find({ order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: string): Promise<any> {
    const u: any = await this.users.findOne({ where: { id } as FindOptionsWhere<User> });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  
  // 👇 メンション解決のための新しいメソッドを追加 👇
  /**
   * 複数のユーザー名（username）からユーザーIDを取得します。
   * メンション機能で使用されます。
   * @param usernames メンションされたユーザー名の配列（例: ['keigominowa56', 'politician1']）
   * @returns ユーザーエンティティの配列
   */
  async findByUsernames(usernames: string[]): Promise<User[]> {
    // ユーザー名フィールドが存在する前提で検索
    return this.users.find({
      where: {
        username: In(usernames), // 配列内のいずれかのユーザー名に一致
      } as FindOptionsWhere<User>,
      select: ['id', 'username', 'displayName'], // 必要な情報のみを選択
    });
  }
  // 👆 メンション解決のための新しいメソッドを追加 👆

  async create(body: any): Promise<any> {
    if (!body.email) throw new BadRequestException('email is required');
    if (!body.password) throw new BadRequestException('password is required');

    const existing = await this.users.findOne({ where: { email: body.email } as FindOptionsWhere<User> });
    if (existing) throw new BadRequestException('email already exists');

    // ⚠️ 補足: ここで body.username のチェックと設定も追加すると良いでしょう
    
    const hash = await bcrypt.hash(String(body.password), 10);
    const user = this.users.create({
      email: String(body.email),
      passwordHash: hash,
      displayName: body.displayName ?? '',
      role: body.role ?? 'user',
      // username: body.username, // 👈 ユーザーエンティティとDTOにusernameがある場合はこれを追加
    } as any);
    const saved: any = await this.users.save(user as any);
    return saved;
  }

  async update(id: string, body: any): Promise<any> {
    const user: any = await this.findOne(id);
    if (body.displayName !== undefined) user.displayName = String(body.displayName);
    if (body.role !== undefined) user.role = body.role;
    if (body.email !== undefined) user.email = String(body.email);
    // if (body.username !== undefined) user.username = String(body.username); // 👈 usernameがある場合はこれを追加
    const saved: any = await this.users.save(user as any);
    return saved;
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const user = await this.findOne(id);
    await this.users.remove(user);
    return { id, deleted: true };
  }

  async updatePassword(userId: string, newPassword: string) {
    const user: any = await this.findOne(userId);
    const hash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hash;
    await this.users.save(user as any);
    return { ok: true, userId };
  }

  async validatePassword(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }
}