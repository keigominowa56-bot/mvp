import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../entities/user.entity';

@Controller('dev/seed')
export class DevSeedController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  @Public()
  @Post('admin')
  async createAdmin() {
    const id = 'admin-dev-id';

    const existing = await this.users.findOne({ where: { id } });
    if (existing) {
      return { created: false, id: existing.id, email: existing.email, role: existing.role };
    }

    // 開発用の仮パスワードハッシュ（ダミー）。必要ならプロジェクトの方式で生成してください。
    const devPasswordHash =
      '$2b$10$2A3cP6nQmK3QXJ8q3pH2OeXWQYk4sJmCqWj3UqWf2oH3E4V5d6u7y';

    const now = new Date();

    const user = this.users.create({
      id,
      email: 'dev-admin@example.com',
      passwordHash: devPasswordHash,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      name: 'Dev Admin',
      party: null as any,
      constituency: null as any,
      termCount: null as any,
      xHandle: null as any,
      instagramHandle: null as any,
      facebookUrl: null as any,
      youtubeUrl: null as any,
      websiteUrl: null as any,
      addressPref: '',
      addressCity: '',
      createdAt: now,
    } as Partial<User>);

    await this.users.save(user);

    return { created: true, id: user.id, email: user.email, role: user.role };
  }
}