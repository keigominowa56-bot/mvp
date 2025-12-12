import { Controller, Get } from '@nestjs/common';

@Controller('news-ingest')
export class NewsIngestController {
  @Get('health')
  health() {
    return { ok: true };
  }
}