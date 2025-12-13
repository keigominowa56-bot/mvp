import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('posts/:postId/votes')
@UseGuards(ThrottlerGuard)
export class VotesController {
  constructor(private readonly votes: VotesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  async cast(@Param('postId') postId: string, @Body() dto: CreateVoteDto, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.votes.cast(postId, userId, dto);
  }

  @Get('summary')
  async summary(@Param('postId') postId: string) {
    return this.votes.summary(postId);
  }
}