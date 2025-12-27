import { Controller, Get, Query, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('api/admin/reports')
@UseGuards(AuthGuard('jwt'))
export class AdminReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get()
  async list(@Query('status') status?: string, @Query('targetType') targetType?: string, @Query('limit') limit?: number) {
    return this.svc.list({ status, targetType, limit });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; adminNote?: string }) {
    // サービス側で ReportStatus 正規化済み
    return this.svc.updateStatus(id, body.status as any, body.adminNote);
  }

  @Patch(':id/action')
  async action(@Param('id') id: string, @Body() body: { adminNote?: string; action: 'ban-user' | 'hide-post' | 'hide-comment' }) {
    const report = await this.svc.updateStatus(id, 'reviewing' as any, body.adminNote);
    return this.svc.actionOnTarget(report as any, body.action);
  }
}