import { Controller, Post, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

// 開発専用: ワンクリックで管理者ログイン
@Controller('dev/login')
export class DevLoginController {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  @Post('admin')
  async loginAdmin(@Req() req: any) {
    // 開発モードのみ有効
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Dev login disabled in production' };
    }

    // シード想定の管理者メール
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPass123!', 10);
      user = this.userRepo.create({
        email,
        passwordHash: hash,
        role: 'admin',
        status: 'active',
        kycStatus: 'verified',
        planTier: 'free',
        name: '開発管理者',
      });
      await this.userRepo.save(user);
    } else {
      // 念のためロール・ステータス補正
      if (user.role !== 'admin' || user.status !== 'active') {
        user.role = 'admin';
        user.status = 'active';
        await this.userRepo.save(user);
      }
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const accessToken = jwt.sign(payload, secret, { expiresIn: '7d' });

    return { accessToken, user: { id: user.id, email: user.email, role: user.role, name: user.name } };
  }
}