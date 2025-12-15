import { Body, Controller, Get, Param, Post, Delete, Request } from '@nestjs/common';
import { ScheduledPostsService } from './scheduled-posts.service';

@Controller('scheduled-posts')
export class ScheduledPostsController {
  constructor(private readonly svc: ScheduledPostsService) {}

  @Post()
  async schedule(@Request() req: any, @Body() body: { scheduledAt: string | Date; title: string; body: string; tags?: string[] }) {
    const authorId = req?.user?.sub ?? req?.user?.id;
    return this.svc.schedule(authorId, body);
  }

  @Get()
  async list() {
    return this.svc.list();
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Request() req: any) {
    const authorId = req?.user?.sub ?? req?.user?.id;
    return this.svc.cancel(id, authorId);
  }
}