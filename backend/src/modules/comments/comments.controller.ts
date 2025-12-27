import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
// import { Throttle } from '@nestjs/throttler'; // 一時的に非使用（デコレーター引数エラー回避）

@Controller('api/posts')
// @UseGuards(ThrottlerGuard) // 必要であれば APP_GUARD で全体適用する方針に合わせてコメントアウト可
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get(':postId/comments')
  async list(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.comments.list(postId, cursor, parseInt(limit || '20', 10));
  }

  @UseGuards(AuthGuard('jwt'))
  // @Throttle(10, 60) // ライブラリのバージョンによる引数不整合を回避するため一時的に無効化
  @Post(':postId/comments')
  async create(@Param('postId') postId: string, @Body() dto: CreateCommentDto, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.comments.create(postId, userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':postId/comments/:commentId')
  async delete(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.comments.delete(commentId, userId);
  }
}
