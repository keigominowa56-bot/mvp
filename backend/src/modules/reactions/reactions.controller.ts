import { Controller, Get, Query, Post, Body, Request } from '@nestjs/common';

@Controller('reactions')
export class ReactionsController {
  @Get('my')
  async my(@Query('targetId') targetId: string, @Request() req: any) {
    return { ok: true, targetId, userId: req?.user?.id ?? null };
  }

  @Post()
  async create(@Body() body: { targetId: string; type: string }, @Request() req: any) {
    return { ok: true, body, userId: req?.user?.id ?? null };
  }
}