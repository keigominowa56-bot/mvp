import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from 'src/entities/user.entity';
import { Member } from 'src/entities/member.entity'; // Memberエンティティをimport

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Member) private readonly members: Repository<Member>, // Memberリポジトリを注入
  ) {}

  async findById(id: string): Promise<User> {
    const u = await this.users.findOne({ where: { id } as FindOptionsWhere<User> });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async findAll(): Promise<User[]> {
    return this.users.find();
  }

  async updateProfile(userId: string, dto: {
    name?: string;
    username?: string;
    profileImageUrl?: string;
    supportedPartyId?: string;
  }): Promise<User> {
    const user = await this.findById(userId);
    
    // ユーザー名の重複チェック
    if (dto.username && dto.username !== user.username) {
      const existing = await this.users.findOne({ where: { username: dto.username } });
      if (existing) {
        throw new Error('このユーザーIDは既に使用されています');
      }
    }
    
    // 名前の重複チェック（名前は一意である必要がある）
    if (dto.name && dto.name !== user.name) {
      const existing = await this.users.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new Error('この名前は既に使用されています');
      }
    }
    
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.profileImageUrl !== undefined) user.profileImageUrl = dto.profileImageUrl;
    if (dto.supportedPartyId !== undefined) user.supportedPartyId = dto.supportedPartyId;
    
    return this.users.save(user);
  }

  // createUser：usersとmembersに両方登録
  async createUser(body: {
    email: string;
    password: string;
    name?: string;
    nickname?: string | null;
    phoneNumber?: string | null;
    ageGroup?: string | null;
    role?: 'admin' | 'politician' | 'citizen';
    status?: UserStatus;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(body.password, 10);

    // 1. usersに登録
    const u = this.users.create({
      email: body.email,
      passwordHash,
      name: body.name ?? null,
      nickname: body.nickname ?? null,
      phoneNumber: body.phoneNumber ?? null,
      ageGroup: body.ageGroup ?? null,
      role: body.role ?? 'citizen',
      status: body.role === 'politician' ? 'pending' : (body.status ?? 'pending'),
      emailVerified: false,
      phoneVerified: false,
    });
    const user = await this.users.save(u);

    // 2. membersにも登録（userId: users.id）
    const m = this.members.create({
      name: body.name ?? '',
      email: body.email,
      role: body.role ?? 'citizen',
      user: user,
      userId: user.id,
    });
    await this.members.save(m);

    return user;
  }
}