import { Controller, Post } from '@nestjs/common';
import { NewsIngestService } from './news-ingest.service';

@Controller('news-ingest')
export class NewsIngestController {
  constructor(private readonly svc: NewsIngestService) {}

  // 管理用の手動取り込み（簡易）
  @Post('pull')
  async pull() {
    await this.svc.pullAndCreate();
    return { ok: true };
  }
}