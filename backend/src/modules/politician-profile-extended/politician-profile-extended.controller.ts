import { Controller, Get, Post, Put, Body, UseGuards, Request, HttpException, HttpStatus, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliticianProfileExtendedService } from './politician-profile-extended.service';

@Controller('api/politician/profile')
export class PoliticianProfileExtendedController {
  constructor(private readonly service: PoliticianProfileExtendedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    try {
      const userId = req.user?.sub ?? req.user?.id;
      console.log('[PoliticianProfileExtendedController] getProfile - userId:', userId);
      if (!userId) {
        throw new HttpException('User ID not found in request', HttpStatus.UNAUTHORIZED);
      }
      return await this.service.getProfile(userId);
    } catch (error: any) {
      console.error('[PoliticianProfileExtendedController] getProfile error:', error);
      throw new HttpException(
        error.message || 'プロフィールの取得に失敗しました',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('public/:userId')
  async getPublicProfile(@Param('userId') userId: string) {
    // 公開用エンドポイント（認証不要）
    return this.service.getProfile(userId);
  }

  @Post()
  @Put()
  @UseGuards(JwtAuthGuard)
  async upsertProfile(@Request() req: any, @Body() dto: {
    name?: string;
    profileImageUrl?: string;
    district?: string;
    party?: string;
    bio?: string;
    pledges?: string;
    socialLinks?: Record<string, string>;
  }) {
    try {
      const userId = req.user?.sub ?? req.user?.id;
      console.log('[PoliticianProfileExtendedController] upsertProfile - userId:', userId);
      if (!userId) {
        throw new HttpException('User ID not found in request', HttpStatus.UNAUTHORIZED);
      }
      return await this.service.upsertProfile(userId, dto);
    } catch (error: any) {
      console.error('[PoliticianProfileExtendedController] upsertProfile error:', error);
      throw new HttpException(
        error.message || 'プロフィールの保存に失敗しました',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

