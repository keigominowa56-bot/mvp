import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
// 実体に合わせて後で修正します
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService
  ) {}

  async register(dto: { email: string; password: string; displayName?: string; role?: string }) {
    if (!dto.email || !dto.password) throw new BadRequestException('email and password are required');
    const existing = await this.users.findOne({ where: { email: dto.email } as FindOptionsWhere<User> });
    if (existing) throw new BadRequestException('email already exists');

    const hash = await bcrypt.hash(dto.password, 10);
    // エンティティの実フィールドに合わせて保存
    const user = this.users.create({
      email: dto.email,
      // 一旦 passwordHash を使用。user.entity.ts に合わせて後で修正します
      passwordHash: hash,
      displayName: dto.displayName ?? '',
      role: (dto.role as any) ?? 'user',
    } as any);
    const saved: any = await this.users.save(user as any);

    const accessToken = await this.jwt.signAsync({ sub: saved.id, email: saved.email, role: saved.role });
    return { accessToken, userId: saved.id };
  }

  async login(email: string, password: string) {
    const user: any = await this.users.findOne({ where: { email } as FindOptionsWhere<User> });
    if (!user) throw new UnauthorizedException('invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash ?? user.password);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, userId: user.id };
  }

  async me(userId: string) {
    const user: any = await this.users.findOne({ where: { id: userId } as FindOptionsWhere<User> });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
  }

  async validatePassword(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }
}