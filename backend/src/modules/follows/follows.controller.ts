import { Controller, Post, Delete, Param, Get, Req } from '@nestjs/common';
import { FollowsService } from './follows.service';

@Controller('follows')
export class FollowsController {
  constructor(private readonly svc: FollowsService) {}

  @Post(':toUserId')
  follow(@Req() req: any, @Param('toUserId') toUserId: string) {
    return this.svc.follow(req.user, Number(toUserId));
  }

  @Delete(':toUserId')
  unfollow(@Req() req: any, @Param('toUserId') toUserId: string) {
    return this.svc.unfollow(req.user, Number(toUserId));
  }

  @Get('me')
  mine(@Req() req: any) {
    return this.svc.listFollowing(req.user.id);
  }
}
