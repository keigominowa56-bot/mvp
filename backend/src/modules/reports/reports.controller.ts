import { Body, Controller, Post, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
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