import { Body, Controller, Delete, Get, Param, Post, Query, Request } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body()
    body: {
      category?: string | null;
      type: string;
      path: string;
      originalName?: string | null;
      sizeBytes?: number | null;
      mimeType?: string | null;
      meta?: Record<string, any> | null;
    },
  ) {
    const ownerUserId = req?.user?.sub ?? req?.user?.id ?? null;
    return this.svc.create({
      ownerUserId,
      category: body.category ?? null,
      type: body.type,
      path: body.path,
      originalName: body.originalName ?? null,
      sizeBytes: body.sizeBytes ?? null,
      mimeType: body.mimeType ?? null,
      meta: body.meta ?? null,
    });
  }

  @Get()
  async list(@Request() req: any, @Query('limit') limit?: number) {
    const ownerUserId = req?.user?.sub ?? req?.user?.id;
    return this.svc.listByOwner(ownerUserId, limit ?? 100);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post(':id/meta')
  async updateMeta(@Param('id') id: string, @Body() body: { meta: Record<string, any> }) {
    return this.svc.updateMeta(id, body.meta);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.svc.delete(id);
  }
}