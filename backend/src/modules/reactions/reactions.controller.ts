import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReactionType } from '../../enums/reaction-type.enum';

@Controller('reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly service: ReactionsService) {}

  @Get('summary')
  async summary(@Query('targetId') targetId: string) {
    return this.service.getSummary(targetId);
  }

  @Get('my')
  async my(@Query('targetId') targetId: string, @Request() req) {
    return this.service.getMyReaction(targetId, req.user.sub);
  }

  @Post('toggle')
  async toggle(
    @Body('targetId') targetId: string,
    @Body('type') type: 'like' | 'agree' | 'disagree',
    @Request() req,
  ) {
    const result = await this.service.toggle(targetId, req.user.sub, type as ReactionType);
    const summary = await this.service.getSummary(targetId);
    return { ...result, summary };
  }
}