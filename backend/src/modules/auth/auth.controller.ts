import { Controller, Post, Body, UseGuards, Request, Get, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { randomBytes } from 'crypto';
import { RolesGuard } from '../../common/guards/roles.guard';

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
    const user = await this.userRepo.findOne({ where: { email: body.email } });
    if (user) {
      user.emailVerifyToken = randomBytes(16).toString('hex');
      if (body.phoneNumber) {
        user.phoneNumber = body.phoneNumber;
        user.phoneVerifyCode = (Math.floor(100000 + Math.random() * 900000)).toString();
      }
      await this.userRepo.save(user);
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
    // TODO: User entity needs phoneVerified field
    // user.phoneVerified = true;
    user.phoneVerifyCode = null as any;
    await this.userRepo.save(user);
    return { verified: true };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  // 正式仕様: DB照会してユーザー詳細を返す（認証必須）
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  async me(@Request() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('missing user');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('user not found');
    // 必要に応じて返すフィールドを限定
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      // TODO: User entity needs addressPref, addressCity, phoneVerified fields
      // addressPref: user.addressPref,
      // addressCity: user.addressCity,
      emailVerified: user.emailVerified,
      // phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
    };
  }
}