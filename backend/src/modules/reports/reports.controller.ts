import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Param,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  // 通報作成
  @Post()
  create(@Req() req: any, @Body() dto: CreateReportDto) {
    return this.svc.create(req.user, dto);
  }

  // 管理者用一覧
  @Get('admin')
  findAllAdmin(@Req() req: any) {
    if (req.user?.role !== 'admin') {
      return {
        message: '管理者のみ閲覧可能',
        error: 'Forbidden',
        statusCode: 403,
      };
    }
    return this.svc.findAllAdmin();
  }

  // 管理者アクション (hide / ignore など)
  @Post('admin/:id/:action')
  adminAct(
    @Req() req: any,
    @Param('id') id: string,
    @Param('action') action: string,
  ) {
    if (req.user?.role !== 'admin') {
      return {
        message: '管理者のみ操作可能',
        error: 'Forbidden',
        statusCode: 403,
      };
    }
    return this.svc.adminAction(Number(id), action);
  }
}