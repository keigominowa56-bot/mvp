import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

type JwtPayload = { sub: string; role: UserRole };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  async validateUser(id: string, password: string): Promise<User> {
    const user = await this.users.findByEmailOrPhone(id);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async signTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwt.signAsync<JwtPayload>(payload, { expiresIn: 900 });
    const refreshExpires = parseInt(this.cfg.get<string>('JWT_REFRESH_EXPIRES_IN_SECONDS') || '604800', 10); // 7日
    const refreshToken = await this.jwt.signAsync<JwtPayload>(payload, {
      secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpires,
    });
    return { accessToken, refreshToken };
  }
}