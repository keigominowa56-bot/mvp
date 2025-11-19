import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Votes')
@Controller('votes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vote' })
  @ApiResponse({ status: 201, description: 'Vote created successfully' })
  @ApiResponse({ status: 409, description: 'User has already voted on this pledge' })
  async create(@Body() createVoteDto: CreateVoteDto, @Request() req) {
    // Override userId with authenticated user's ID
    createVoteDto.userId = req.user.sub;
    const vote = await this.votesService.create(createVoteDto);
    
    // Get updated vote counts
    const stats = await this.votesService.getVoteStats(createVoteDto.pledgeId);
    
    return {
      ...vote,
      supportCount: stats.supportCount,
      opposeCount: stats.opposeCount,
      voteCount: stats.totalVotes
    };
  }

  @Get('pledge/:pledgeId')
  @ApiOperation({ summary: 'Get votes for a specific pledge' })
  @ApiResponse({ status: 200, description: 'Votes retrieved successfully' })
  findByPledge(@Param('pledgeId') pledgeId: string) {
    return this.votesService.findByPledge(pledgeId);
  }

  @Get('pledge/:pledgeId/stats')
  @ApiOperation({ summary: 'Get vote statistics for a specific pledge' })
  @ApiResponse({ status: 200, description: 'Vote statistics retrieved successfully' })
  getVoteStats(@Param('pledgeId') pledgeId: string) {
    return this.votesService.getVoteStats(pledgeId);
  }

  @Get('my-votes')
  @ApiOperation({ summary: 'Get current user votes' })
  @ApiResponse({ status: 200, description: 'User votes retrieved successfully' })
  findByUser(@Request() req) {
    return this.votesService.findByUser(req.user.sub);
  }

  @Get('pledge/:pledgeId/my-vote')
  @ApiOperation({ summary: 'Get current user vote for a specific pledge' })
  @ApiResponse({ status: 200, description: 'User vote retrieved successfully' })
  getUserVote(@Param('pledgeId') pledgeId: string, @Request() req) {
    return this.votesService.getUserVote(req.user.sub, pledgeId);
  }

  @Patch('pledge/:pledgeId')
  @ApiOperation({ summary: 'Update current user vote for a specific pledge' })
  @ApiResponse({ status: 200, description: 'Vote updated successfully' })
  @ApiResponse({ status: 404, description: 'Vote not found' })
  async update(
    @Param('pledgeId') pledgeId: string,
    @Body('voteType') voteType: 'support' | 'oppose',
    @Request() req,
  ) {
    const vote = await this.votesService.update(req.user.sub, pledgeId, voteType);
    
    // Get updated vote counts
    const stats = await this.votesService.getVoteStats(pledgeId);
    
    return {
      ...vote,
      supportCount: stats.supportCount,
      opposeCount: stats.opposeCount,
      voteCount: stats.totalVotes
    };
  }

  @Delete('pledge/:pledgeId')
  @ApiOperation({ summary: 'Remove current user vote for a specific pledge' })
  @ApiResponse({ status: 200, description: 'Vote removed successfully' })
  @ApiResponse({ status: 404, description: 'Vote not found' })
  async remove(@Param('pledgeId') pledgeId: string, @Request() req) {
    await this.votesService.remove(req.user.sub, pledgeId);
    
    // Get updated vote counts
    const stats = await this.votesService.getVoteStats(pledgeId);
    
    return {
      supportCount: stats.supportCount,
      opposeCount: stats.opposeCount,
      voteCount: stats.totalVotes
    };
  }
}
