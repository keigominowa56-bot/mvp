import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  find(@Param('postId') postId: string) {
    return this.commentsService.findByPost(Number(postId));
  }

  @Post()
  create(@Req() req: any, @Param('postId') postId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user, Number(postId), dto);
  }
}
