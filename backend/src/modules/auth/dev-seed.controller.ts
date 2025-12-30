import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';

@Controller('auth/dev-seed')
export class DevSeedController {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  @Post('user')
  async seedUser(
    @Body()
    body: {
      email: string;
      password: string;
      name?: string;
      nickname?: string | null;
      phoneNumber?: string | null;
      ageGroup?: string | null;
    },
  ) {
    const exists = await this.userRepo.findOne({ where: { email: body.email } });
    if (exists) {
      return { ok: true, id: exists.id };
    }

    const user = this.userRepo.create({
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      name: body.name || null,
      nickname: body.nickname ?? null,
      phoneNumber: body.phoneNumber ?? null,
      ageGroup: body.ageGroup ?? null,
      role: 'citizen',
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
    } as any);

    const saved = await this.userRepo.save(user); // save は単体 User を返す前提
    const id = (saved as any)?.id; // 厳密型付けを避け、never を回避
    return { ok: true, id };
  }

  @Post('admin')
  async seedAdmin(
    @Body()
    body: {
      email: string;
      password: string;
      name?: string;
      nickname?: string | null;
    },
  ) {
    const exists = await this.userRepo.findOne({ where: { email: body.email } });
    if (exists) {
      return { ok: true, id: exists.id, message: '既に存在するユーザーです' };
    }

    const user = this.userRepo.create({
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      name: body.name || null,
      nickname: body.nickname ?? null,
      role: 'admin',
      status: 'approved', // 管理者は承認済みとして作成
      emailVerified: true, // 開発環境では認証済みとして作成
      phoneVerified: false,
    } as any);

    const saved = await this.userRepo.save(user);
    const id = (saved as any)?.id;
    return { ok: true, id, message: '管理者ユーザーを作成しました' };
  }
}