import { Body, Controller, Post, Get, UnauthorizedException, Headers, UseGuards, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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
  async adminLogin(@Body() body: { email: string; password: string }) {
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

  // Firebase Authentication用エンドポイント（一般ユーザー）
  @Post('register-firebase')
  async registerFirebase(
    @Headers('authorization') authHeader: string,
    @Body() body: { name: string; username?: string; email: string; phone: string; prefecture: string; prefectureCode: string; city: string }
  ) {
    return this.auth.registerFirebaseUser(authHeader, body);
  }

  @Post('login-firebase')
  async loginFirebase(@Headers('authorization') authHeader: string) {
    return this.auth.loginFirebaseUser(authHeader);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader: string) {
    return this.auth.getCurrentUser(authHeader);
  }

  @Get('check-username')
  async checkUsername(@Query('username') username: string) {
    return this.auth.checkUsernameAvailability(username);
  }

  // 管理者専用: 議員登録エンドポイント
  @UseGuards(AuthGuard('jwt'))
  @Post('register/politician')
  async registerPoliticianByAdmin(
    @Body() body: { email: string; password: string; name: string },
    @Req() req: any
  ) {
    const userRole = req.user?.role || 'user';
    if (userRole !== 'admin') {
      throw new UnauthorizedException('この機能は管理者のみ利用できます');
    }
    return this.auth.politicianSignup(body);
  }
}
