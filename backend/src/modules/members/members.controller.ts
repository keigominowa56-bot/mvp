import { Controller, Get, Query } from '@nestjs/common';

@Controller('members')
export class MembersController {
  @Get()
  async list(@Query('q') q?: string) {
    // Swagger ダミーは削除、必要なら @nestjs/swagger を導入して利用
    return { ok: true, q: q ?? '' };
  }
}