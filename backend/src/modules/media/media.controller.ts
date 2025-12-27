import { Body, Controller, Delete, Get, Param, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('api/media')
@UseGuards(AuthGuard('jwt'))
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('ファイルがアップロードされませんでした');
    }

    const userId = req.user?.sub ?? req.user?.id;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const media = await this.svc.create({
      ownerUserId: userId,
      category: req.body.category || 'avatar',
      type: file.mimetype.startsWith('image/') ? 'image' : 'file',
      path: `/uploads/${fileName}`,
      originalName: file.originalname,
      sizeBytes: file.size,
      mimeType: file.mimetype,
    });

    // mediaはMediaエンティティなので、idプロパティが存在する
    return {
      mediaId: (media as any).id,
      url: `/uploads/${fileName}`,
      path: `/uploads/${fileName}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'file',
    };
  }
}