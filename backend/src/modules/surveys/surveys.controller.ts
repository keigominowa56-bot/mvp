import { Controller, Get, Param, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  async available(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.surveys.availableForUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':surveyId/responses')
  async submit(
    @Param('surveyId') surveyId: string,
    @Req() req: any,
    @Body() dto: { answers: Record<string, any> },
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.surveys.submitResponse(surveyId, userId, dto);
  }
}