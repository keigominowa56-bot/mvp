import { Controller, Post, Delete, Param, UseGuards, Request, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentLikesService } from './comment-likes.service';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentLikesController {
  constructor(private readonly svc: CommentLikesService) {}

  @Post(':id/like')
  async like(@Param('id') id: string, @Request() req: any) {
    const l = await this.svc.like(id, req.user.sub);
    return { liked: true, likeId: l.id };
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @Request() req: any) {
    return this.svc.unlike(id, req.user.sub);
  }

  @Get(':id/likes-count')
  async count(@Param('id') id: string) {
    const count = await this.svc.count(id);
    return { count };
  }

  @Get(':id/is-liked')
  async isLiked(@Param('id') id: string, @Request() req: any) {
    const liked = await this.svc.isLiked(id, req.user.sub);
    return { liked };
  }
}