import { Controller, Post, Body } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Controller('admin/bulk-posts')
export class AdminBulkPostsController {
  @Post('create')
  async create(@Body() body: any) {
    // 開発用のダミー処理（実際の一括作成は、対象エンティティのサービスで行ってください）
    const hash = body?.password ? await bcrypt.hash(String(body.password), 10) : undefined;
    return { ok: true, hashed: Boolean(hash) };
  }
}