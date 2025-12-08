import { Controller, Post, Body } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Controller('admin/politicians')
export class AdminPoliticiansController {
  @Post('create')
  async create(@Body() body: any) {
    const hash = body?.password ? await bcrypt.hash(String(body.password), 10) : undefined;
    return { ok: true, hashed: Boolean(hash) };
  }
}