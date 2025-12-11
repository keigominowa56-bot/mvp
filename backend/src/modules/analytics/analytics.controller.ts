import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('analytics/my')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('posts')
  async myPosts(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.analytics.myPostsSummary(userId);
  }

  @Get('followers/demographics')
  async myFollowers(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.analytics.followersDemographics(userId);
  }

  @Get('export.csv')
  async exportCsv(@Req() req: any, @Res() res: Response) {
    const userId = req.user?.sub ?? req.user?.id;
    const csv = await this.analytics.exportMyPostsCsv(userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="my-posts-summary.csv"');
    res.send(csv);
  }
}