import { Controller, Post, Body, Req, UnauthorizedException, Get, Param, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/follows')
export class FollowsController {
  constructor(private readonly svc: FollowsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('follow')
  async follow(@Body() body: { targetUserId: string }, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.svc.follow(userId, body.targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('unfollow')
  async unfollow(@Body() body: { targetUserId: string }, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.svc.unfollow(userId, body.targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('followed')
  async followed(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const followedUsers = await this.svc.listFollowedUsers(userId);
    return { ids: followedUsers.map(u => u.id), users: followedUsers };
  }

  @Get(':userId/count')
  async getFollowerCount(@Param('userId') userId: string) {
    const count = await this.svc.getFollowerCount(userId);
    return { count };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId/is-following')
  async isFollowing(@Param('userId') targetUserId: string, @Req() req: any) {
    const followerUserId = req.user?.sub ?? req.user?.id;
    if (!followerUserId) throw new UnauthorizedException();
    const isFollowing = await this.svc.isFollowing(followerUserId, targetUserId);
    return { isFollowing };
  }
}