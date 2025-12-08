import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly svc: RecommendationsService) {}

  // 公開: 未ログインでもOKな推薦（ダミー）
  @Public()
  @Get()
  async publicList(@Query('limit') limit = '8') {
    const lim = Math.min(Math.max(Number(limit) || 8, 1), 50);
    return this.svc.getPublicRecommendations(lim);
  }
}