import { Controller, Get, Query } from '@nestjs/common';

@Controller('recommendations')
export class RecommendationsController {
  @Get()
  async list(@Query('limit') limit = '5') {
    const n = Math.min(parseInt(limit, 10) || 5, 20);
    const users = Array.from({ length: n }).map((_, i) => ({
      id: i + 1,
      name: `おすすめユーザー${i + 1}`,
      email: `user${i + 1}@example.com`,
      reason: '共通のトピック/地域/フォロー関係からの暫定レコメンド',
    }));
    return { users };
  }
}