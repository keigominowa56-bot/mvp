import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @Request() req) {
    const role = req.user?.role;
    if (role !== 'user') throw new ForbiddenException('Only users can comment');
    return this.comments.create(dto, req.user?.sub);
  }

  @Get('post/:postId')
  findForPost(@Param('postId') postId: string) {
    return this.comments.findForPost(postId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const role = req.user?.role;
    if (role !== 'user') throw new ForbiddenException('Only users can remove own comments');
    return this.comments.remove(id);
  }
}