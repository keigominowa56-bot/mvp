import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async validateUser(id: string, password: string): Promise<User> {
    const user =
      (await this.users.findOne({ where: { email: id } })) ??
      (await this.users.findOne({ where: { phone: id } }));
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(id: string, password: string) {
    const user = await this.validateUser(id, password);
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    // ジェネリック指定を削除（string 戻り値）
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: 900 });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: '7d' });

    return {
      user: { id: user.id, email: user.email, role: user.role, nickname: user.nickname },
      accessToken,
      refreshToken,
    };
  }
}