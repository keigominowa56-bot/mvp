import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('follows')
export class FollowsController {
  constructor(private readonly follows: FollowsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':targetUserId')
  async follow(@Param('targetUserId') targetUserId: string, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.follows.follow(userId, targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':targetUserId')
  async unfollow(@Param('targetUserId') targetUserId: string, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.follows.unfollow(userId, targetUserId);
  }

  // フォロワー分布（年代/地域/支持政党）
  @Get('/users/:id/followers/demographics')
  async followersDemographics(@Param('id') id: string) {
    return this.follows.followersDemographics(id);
  }
}