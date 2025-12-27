import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuthGuard } from '@nestjs/passport';
// import { Throttle } from '@nestjs/throttler'; // 一時的に非使用（デコレーター引数エラー回避）

@Controller('api/posts')
// @UseGuards(ThrottlerGuard) // 必要であれば APP_GUARD で全体適用する方針に合わせてコメントアウト可
export class VotesController {
  constructor(private readonly votes: VotesService) {}

  @UseGuards(AuthGuard('jwt'))
  // @Throttle(5, 60) // ライブラリのバージョンによる引数不整合を回避するため一時的に無効化
  @Post(':postId/votes')
  async cast(@Param('postId') postId: string, @Body() dto: CreateVoteDto, @Req() req: any) {
    console.log('[Votes Controller] POST /api/posts/:postId/votes - postId:', postId);
    const userId = req.user?.sub ?? req.user?.id;
    console.log('[Votes Controller] userId:', userId, 'choice:', dto.choice);
    return this.votes.cast(postId, userId, dto);
  }

  @Get(':postId/votes/summary')
  async summary(@Param('postId') postId: string) {
    console.log('[Votes Controller] GET /api/posts/:postId/votes/summary - postId:', postId);
    return this.votes.summary(postId);
  }
}
