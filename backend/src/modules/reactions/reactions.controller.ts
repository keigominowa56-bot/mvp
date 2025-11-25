import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactDto } from './dto/react.dto';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly svc: ReactionsService) {}

  @Post()
  addOrToggle(@Req() req: any, @Body() dto: ReactDto) {
    return this.svc.addOrToggle(req.user, dto);
  }

  @Get('my')
  async my(
    @Req() req: any,
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string
  ) {
    const reaction = await this.svc.myReaction(req.user, targetType, Number(targetId));
    // 常に JSON （null を含む）を返す
    return { reaction: reaction ? reaction : null };
  }

  @Get('summary')
  summary(@Query('targetType') targetType: string, @Query('targetId') targetId: string) {
    return this.svc.summary(targetType, Number(targetId));
  }
}