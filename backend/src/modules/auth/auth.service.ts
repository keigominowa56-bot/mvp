import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    name?: string;
    age?: number;
    addressPref?: string;
    addressCity?: string;
    phoneNumber?: string;
  }) {
    if (!data.email || !data.password) throw new BadRequestException('email & password required');
    const exist = await this.userRepo.findOne({ where: { email: data.email } });
    if (exist) throw new BadRequestException('email already registered');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const u = this.userRepo.create({
      email: data.email,
      passwordHash,
      role: 'user',
      name: data.name,
      age: data.age,
      addressPref: data.addressPref,
      addressCity: data.addressCity,
      phoneNumber: data.phoneNumber,
      kycStatus: 'verified',
      planTier: 'free',
    });
    const saved = await this.userRepo.save(u);
    const token = this.jwt.sign({ sub: saved.id, email: saved.email, role: saved.role });
    return { accessToken: token, user: { id: saved.id, email: saved.email } };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'banned') throw new UnauthorizedException('Account banned');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { accessToken: token, user: { id: user.id, email: user.email, role: user.role } };
  }
}