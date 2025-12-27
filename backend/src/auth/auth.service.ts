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
  nickname?: string | null;
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
      (await this.users.findOne({ where: { phoneNumber: id } })); // phone -> phoneNumber に修正
    if (!user || !user.passwordHash) throw new UnauthorizedException('User not found');
    const passwordHash = user.passwordHash; // 型ナローイングのため変数に代入
    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(id: string, password: string) {
    const user = await this.validateUser(id, password);
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, nickname: user.nickname };

    const accessToken = await this.jwt.signAsync(payload, { expiresIn: 900 });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nickname: user.nickname,
        addressPref: user.addressPref,
        addressCity: user.addressCity,
      },
      accessToken,
      refreshToken,
    };
  }
}
