import { Controller, Post, Body, Req, UnauthorizedException, Get } from '@nestjs/common';
import { FollowsService } from './follows.service';

@Controller('follows')
export class FollowsController {
  constructor(private readonly svc: FollowsService) {}

  @Post('follow')
  async follow(@Body() body: { targetUserId: string }, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.svc.follow(userId, body.targetUserId);
  }

  @Post('unfollow')
  async unfollow(@Body() body: { targetUserId: string }, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.svc.unfollow(userId, body.targetUserId);
  }

  @Get('followed')
  async followed(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    const ids = await this.svc.listFollowedIds(userId);
    return { ids };
  }
}