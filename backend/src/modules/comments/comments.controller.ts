import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ReactDto } from './dto/react.dto';

@Controller()
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get('posts/:postId/comments')
  async list(@Param('postId', ParseIntPipe) postId: number) {
    return this.comments.listByPost(postId);
  }

  @Get('comments/:commentId')
  async get(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.comments.get(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:postId/comments')
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.comments.createComment(postId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:commentId/replies')
  async reply(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: CreateReplyDto,
    @Req() req: any,
  ) {
    return this.comments.reply(commentId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:commentId/reactions')
  async react(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: ReactDto,
    @Req() req: any,
  ) {
    return this.comments.react(commentId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId/reactions')
  async unreact(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: ReactDto,
    @Req() req: any,
  ) {
    return this.comments.unreact(commentId, req.user.id, dto);
  }
}