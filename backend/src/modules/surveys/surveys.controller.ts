import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SurveysService } from './surveys.service';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @Get('available/:userId')
  async available(@Param('userId') userId: string) {
    return this.surveys.availableForUser(userId);
  }

  @Post(':surveyId/submit/:userId')
  async submit(
    @Param('surveyId') surveyId: string,
    @Param('userId') userId: string,
    @Body() dto: { answers: Record<string, any> },
  ) {
    return this.surveys.submitResponse(surveyId, userId, dto);
  }
}