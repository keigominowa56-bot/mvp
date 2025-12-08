import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
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

  async create(body: any): Promise<any> {
    if (!body.email) throw new BadRequestException('email is required');
    if (!body.password) throw new BadRequestException('password is required');

    const existing = await this.users.findOne({ where: { email: body.email } as FindOptionsWhere<User> });
    if (existing) throw new BadRequestException('email already exists');

    const hash = await bcrypt.hash(String(body.password), 10);
    const user = this.users.create({
      email: String(body.email),
      passwordHash: hash,
      displayName: body.displayName ?? '',
      role: body.role ?? 'user',
    } as any);
    const saved: any = await this.users.save(user as any);
    return saved;
  }

  async update(id: string, body: any): Promise<any> {
    const user: any = await this.findOne(id);
    if (body.displayName !== undefined) user.displayName = String(body.displayName);
    if (body.role !== undefined) user.role = body.role;
    if (body.email !== undefined) user.email = String(body.email);
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