import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { PoliticiansService } from './politicians.service';

@Controller('politicians')
export class PoliticiansController {
  constructor(private readonly service: PoliticiansService) {}

  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.service.getProfile(id);
  }

  @Patch(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: Partial<{ name: string; nickname: string; regionId: string; partyId: string }>,
  ) {
    // editorUserId は省略（サービス側で _prefix 未使用扱い）
    return this.service.updateProfile(id, 'system', dto);
  }

  @Get('search')
  async search(
    @Body() params: { region?: string; party?: string; q?: string },
  ) {
    return this.service.search(params);
  }

  @Get(':id/funding-summary')
  async fundingSummary(@Param('id') id: string) {
    return this.service.fundingSummary(id);
  }
}