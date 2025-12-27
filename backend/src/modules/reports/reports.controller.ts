import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('api/reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body()
    body: {
      targetType: 'user' | 'post' | 'comment';
      targetId: string;
      type: string;
      reasonCategory?: string;
      reasonText?: string;
      details?: Record<string, any>;
    },
  ) {
    const reporterId = req?.user?.sub ?? req?.user?.id;
    if (!reporterId) {
      throw new Error('認証が必要です');
    }
    return this.svc.create({
      reporterId,
      targetType: body.targetType,
      targetId: body.targetId,
      type: body.type,
      reasonCategory: body.reasonCategory,
      reasonText: body.reasonText,
      details: body.details,
    });
  }
}
