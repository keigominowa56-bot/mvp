import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScheduledPostsService } from './scheduled-posts.service';

@Controller('admin/scheduled-posts')
@UseGuards(JwtAuthGuard)
export class ScheduledPostsController {
  constructor(private readonly svc: ScheduledPostsService) {}

  @Post()
  async schedule(
    @Body() body: { authorId?: string; title?: string; body: string; tags?: string[]; scheduledAt: string },
    @Request() req: any,
  ) {
    return this.svc.schedule(req.user.sub, body);
  }

  @Get()
  async list() {
    return this.svc.list();
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req: any) {
    return this.svc.cancel(id, req.user.sub);
  }
}