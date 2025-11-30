import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Post()
  async create(
    @Body() body: { targetType: 'post' | 'comment' | 'user'; targetId: string; reasonCategory: 'abuse' | 'spam' | 'misinfo' | 'other'; reasonText?: string },
    @Request() req: any,
  ) {
    return this.svc.create({
      reporterId: req.user.sub,
      targetType: body.targetType,
      targetId: body.targetId,
      reasonCategory: body.reasonCategory,
      reasonText: body.reasonText,
    });
  }
}