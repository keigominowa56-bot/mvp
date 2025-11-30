import { Controller, Get, Query, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard)
export class AdminReportsController {
  constructor(private readonly svc: ReportsService) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admins only');
  }

  @Get()
  async list(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('limit') limitQ?: string,
  ) {
    this.ensureAdmin(req);
    const limit = Math.min(500, Math.max(1, Number(limitQ) || 100));
    return this.svc.list({ status, targetType, limit });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'open' | 'reviewing' | 'resolved' | 'dismissed' | 'actioned'; adminNote?: string },
    @Request() req: any,
  ) {
    this.ensureAdmin(req);
    return this.svc.updateStatus(id, body.status, body.adminNote);
  }

  @Patch(':id/action')
  async action(
    @Param('id') id: string,
    @Body() body: { action: 'ban-user' | 'hide-post' | 'hide-comment'; adminNote?: string },
    @Request() req: any,
  ) {
    this.ensureAdmin(req);
    const report = await this.svc.updateStatus(id, 'reviewing', body.adminNote);
    return this.svc.actionOnTarget(report as any, body.action);
  }
}