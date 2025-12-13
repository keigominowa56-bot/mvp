import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: { id: string; password: string }) {
    return this.auth.login(body.id, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me')
  async me(@Req() req: any) {
    const user = req.user;
    return { user };
  }
}