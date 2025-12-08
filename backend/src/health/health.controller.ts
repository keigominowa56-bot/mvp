import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  app() {
    return this.health.app();
  }

  @Public()
  @Get('db')
  async db() {
    return this.health.db();
  }
}