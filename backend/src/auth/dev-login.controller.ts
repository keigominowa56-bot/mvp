import { Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../common/decorators/public.decorator';

@Controller('dev/login')
export class DevLoginController {
  constructor(private readonly jwt: JwtService) {}

  @Public()
  @Post('admin')
  async admin() {
    // 開発用: 管理者権限のトークンを即発行
    const payload = {
      sub: 'admin-dev-id',
      role: 'admin',
      email: 'dev-admin@example.com',
    };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken };
  }
}