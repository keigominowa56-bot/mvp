import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { PoliticiansService } from './politicians.service';
import { UpdatePoliticianDto } from './dto/update-politician.dto';
import { SearchPoliticiansDto } from './dto/search-politicians.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('politicians')
export class PoliticiansController {
  constructor(private readonly service: PoliticiansService) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getProfile(id);
  }

  // 本人のみ更新可（JWT必須）
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePoliticianDto, @Req() req: any) {
    const editorUserId = req.user?.sub ?? req.user?.id;
    return this.service.updateProfile(id, editorUserId, dto);
  }

  // 検索
  @Get()
  async search(@Query() query: SearchPoliticiansDto) {
    return this.service.search(query);
  }

  // 収支のカテゴリサマリー
  @Get(':id/funding/summary')
  async fundingSummary(@Param('id') id: string) {
    return this.service.fundingSummary(id);
  }
}