import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  // findOne -> findById
  async findById(id: string): Promise<User> {
    const u = await this.users.findOne({ where: { id } as FindOptionsWhere<User> });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async findAll(): Promise<User[]> {
    return this.users.find();
  }

  // createUser（登録初期値は必ず 'pending'/未承認）
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
    return await this.users.save(u);
  }
}