import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/signup')
  adminSignup(@Body() body: { email: string; password: string }) {
    // @keygo.jp 以外は弾く
    if (!body.email.endsWith('@keygo.jp')) {
      throw new UnauthorizedException('管理者アカウントは @keygo.jp ドメインのみ登録できます');
    }
    return this.auth.adminSignup(body.email, body.password);
  }

  @Post('admin/login')
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password, 'admin');
  }

  @Post('politician/signup')
  politicianSignup(@Body() body: { email: string; password: string; name: string; regionId?: string | null; partyId?: string | null }) {
    return this.auth.politicianSignup(body);
  }

  @Post('politician/login')
  politicianLogin(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password, 'politician');
  }
}