import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('posts/:postId/comments')
@UseGuards(ThrottlerGuard)
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  async list(@Param('postId') postId: string, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.comments.list(postId, cursor, parseInt(limit || '20', 10));
  }

  @UseGuards(AuthGuard('jwt'))
  @Throttle(10, 60)
  @Post()
  async create(@Param('postId') postId: string, @Body() dto: CreateCommentDto, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.comments.create(postId, userId, dto);
  }
}