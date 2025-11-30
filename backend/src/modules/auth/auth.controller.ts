import { Controller, Post, Body, UseGuards, Request, Get, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Post('register')
  async register(
    @Body() body: {
      email: string;
      password: string;
      name?: string;
      age?: number;
      addressPref?: string;
      addressCity?: string;
      phoneNumber?: string;
    },
  ) {
    const result = await this.auth.register(body);
    // 生成されたユーザーにメール検証トークンと電話コード付与
    const user = await this.userRepo.findOne({ where: { email: body.email } });
    if (user) {
      user.emailVerifyToken = randomBytes(16).toString('hex');
      if (body.phoneNumber) {
        user.phoneNumber = body.phoneNumber;
        user.phoneVerifyCode = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6桁
      }
      await this.userRepo.save(user);
      // 擬似送信ログ
      console.log('[email verify] token=', user.emailVerifyToken, 'email=', user.email);
      if (user.phoneVerifyCode) {
        console.log('[phone verify] code=', user.phoneVerifyCode, 'phone=', user.phoneNumber);
      }
    }
    return result;
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    if (!token) throw new BadRequestException('token required');
    const user = await this.userRepo.findOne({ where: { emailVerifyToken: token } });
    if (!user) throw new BadRequestException('invalid token');
    user.emailVerified = true;
    user.emailVerifyToken = null as any;
    await this.userRepo.save(user);
    return { verified: true };
  }

  @Post('send-phone-code')
  async sendPhoneCode(@Body('email') email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('user not found');
    if (!user.phoneNumber) throw new BadRequestException('phoneNumber not set');
    user.phoneVerifyCode = (Math.floor(100000 + Math.random() * 900000)).toString();
    await this.userRepo.save(user);
    console.log('[phone verify resend] code=', user.phoneVerifyCode, 'phone=', user.phoneNumber);
    return { sent: true };
  }

  @Post('verify-phone')
  async verifyPhone(@Body() body: { email: string; code: string }) {
    const user = await this.userRepo.findOne({ where: { email: body.email } });
    if (!user) throw new BadRequestException('user not found');
    if (!body.code) throw new BadRequestException('code required');
    if (user.phoneVerifyCode !== body.code) throw new BadRequestException('invalid code');
    user.phoneVerified = true;
    user.phoneVerifyCode = null as any;
    await this.userRepo.save(user);
    return { verified: true };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    const u = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!u) throw new BadRequestException('user not found');
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      emailVerified: u.emailVerified,
      phoneVerified: u.phoneVerified,
      name: u.name,
      party: u.party,
      constituency: u.constituency,
      termCount: u.termCount,
      xHandle: u.xHandle,
      instagramHandle: u.instagramHandle,
      facebookUrl: u.facebookUrl,
      youtubeUrl: u.youtubeUrl,
      websiteUrl: u.websiteUrl,
      addressPref: u.addressPref,
      addressCity: u.addressCity,
      createdAt: u.createdAt,
    };
  }
}