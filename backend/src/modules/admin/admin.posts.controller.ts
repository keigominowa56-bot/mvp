import { Body, Controller, Post as HttpPost } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Controller('admin/posts')
export class AdminPostsController {
  @HttpPost('create')
  async create(@Body() body: any) {
    const hash = body?.password ? await bcrypt.hash(String(body.password), 10) : undefined;
    return { ok: true, hashed: Boolean(hash) };
  }
}