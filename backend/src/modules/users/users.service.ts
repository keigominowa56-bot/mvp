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