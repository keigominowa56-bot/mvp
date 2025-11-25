import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '../../lib/swagger-fallback';
import { ExternalFeedsService } from './external-feeds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('External Feeds')
@Controller('external-feeds')
// @UseGuards(JwtAuthGuard, AdminGuard) // デモ用に一時的に無効化
@ApiBearerAuth()
export class ExternalFeedsController {
  constructor(private readonly externalFeedsService: ExternalFeedsService) {}

  @Post('collect-all')
  @ApiOperation({ summary: 'Manually trigger collection of all external feeds (Admin only)' })
  @ApiResponse({ status: 200, description: 'Feed collection started successfully' })
  async collectAllFeeds() {
    try {
      const result = await this.externalFeedsService.collectAllData();
      return result;
    } catch (error) {
      console.error('Error in collect-all endpoint:', error);
      return {
        message: 'Feed collection encountered an error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('collect-member/:memberId')
  @ApiOperation({ summary: 'Manually trigger collection for a specific member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Member feed collection completed successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async collectFeedsForMember(@Param('memberId') memberId: string) {
    await this.externalFeedsService.collectFeedsForMember(memberId);
    return { message: `Feed collection completed for member ${memberId}` };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get external feeds collection statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Collection statistics retrieved successfully' })
  async getCollectionStats() {
    return this.externalFeedsService.getCollectionStats();
  }
}
