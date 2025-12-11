import { Controller, Get, Param, Post, Req, UseGuards, Body } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSurveyResponseDto } from './dto/create-response.dto';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  async available(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.surveys.availableForUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/responses')
  async respond(@Param('id') surveyId: string, @Req() req: any, @Body() dto: CreateSurveyResponseDto) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.surveys.submitResponse(surveyId, userId, dto);
  }
}