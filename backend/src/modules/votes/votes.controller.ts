import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@Controller('posts/:postId/votes')
export class VotesController {
  constructor(private readonly votes: VotesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Throttle(5, 60)
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