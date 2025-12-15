import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Politician } from 'src/entities/politician.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Politician) private readonly politicians: Repository<Politician>,
  ) {}

  async adminSignup(email: string, password: string) {
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new UnauthorizedException('email already registered');
    const passwordHash = await bcrypt.hash(password, 10);
    const u = this.users.create({ email, passwordHash, role: 'admin', status: 'active' } as any);
    await this.users.save(u);
    return { ok: true };
  }

  async politicianSignup(input: { email: string; password: string; name: string; regionId?: string | null; partyId?: string | null }) {
    const existing = await this.users.findOne({ where: { email: input.email } });
    if (existing) throw new UnauthorizedException('email already registered');
    const passwordHash = await bcrypt.hash(input.password, 10);
    const u = this.users.create({ email: input.email, passwordHash, role: 'politician', status: 'active' } as any);
    await this.users.save(u);
    const p = this.politicians.create({
      name: input.name,
      regionId: input.regionId ?? null,
      partyId: input.partyId ?? null,
    } as any);
    await this.politicians.save(p);
    return { ok: true };
  }

  async login(email: string, password: string, expectedRole: 'admin' | 'politician') {
    const u = await this.users.findOne({ where: { email } });
    if (!u) throw new UnauthorizedException('invalid credentials');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid credentials');
    if (u.role !== expectedRole) throw new UnauthorizedException('invalid role');
    const token = jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });
    return { token };
  }
}