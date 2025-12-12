import { Controller, Get, Param, Patch, Body, Query, Req, UseGuards } from '@nestjs/common';
import { PoliticiansService } from './politicians.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('politicians')
export class PoliticiansController {
  constructor(private readonly service: PoliticiansService) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getProfile(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const editorUserId = req.user?.sub ?? req.user?.id;
    return this.service.updateProfile(id, editorUserId, dto);
  }

  @Get()
  async search(
    @Query('region') region?: string,
    @Query('party') party?: string,
    @Query('q') q?: string,
  ) {
    return this.service.search({ region, party, q });
  }

  @Get(':id/funding/summary')
  async fundingSummary(@Param('id') id: string) {
    return this.service.fundingSummary(id);
  }
}