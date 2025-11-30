import { Controller, Post, Get, Param, Body, UseGuards, Request, Patch, ForbiddenException } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votes: VotesService) {}

  @Post()
  async create(@Body() dto: CreateVoteDto, @Request() req) {
    if (req.user?.role !== 'user') throw new ForbiddenException('Only users can vote');
    const vote = await this.votes.create(req.user.sub, dto);
    const stats = await this.votes.getVoteStats(dto.postId);
    return { vote, stats };
  }

  @Patch(':postId')
  async update(@Param('postId') postId: string, @Body('type') type: 'support' | 'oppose', @Request() req) {
    if (req.user?.role !== 'user') throw new ForbiddenException('Only users can vote');
    const vote = await this.votes.update(req.user.sub, postId, type);
    const stats = await this.votes.getVoteStats(postId);
    return { vote, stats };
  }

  @Get('stats/:postId')
  getStats(@Param('postId') postId: string) {
    return this.votes.getVoteStats(postId);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.votes.findByPost(postId);
  }

  @Get('user/:postId')
  getUserVote(@Param('postId') postId: string, @Request() req) {
    return this.votes.getUserVote(req.user.sub, postId);
  }
}