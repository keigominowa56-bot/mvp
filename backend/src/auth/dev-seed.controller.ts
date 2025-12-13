import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';

@Controller('auth/dev-seed')
export class DevSeedController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  @Post('user')
  async seedUser(@Body() body: { email: string; password: string; nickname?: string }) {
    const exists = await this.users.findOne({ where: { email: body.email } });
    if (exists) return { ok: true, id: exists.id };

    const user = this.users.create({
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      name: body.email.split('@')[0],
      nickname: body.nickname || body.email.split('@')[0],
      role: 'user',
      kycStatus: 'pending',
      emailVerified: false,
      phoneNumber: null,
      phoneVerifyCode: null,
      emailVerifyToken: null,
    } as any);

    // 単体保存の戻り値（User）として扱う
    const saved = await this.users.save(user);
    return { ok: true, id: saved.id };
  }
}