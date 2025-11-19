// backend/src/modules/external-feeds/external-feeds.module.ts

import { Module } from '@nestjs/common';
import { ExternalFeedsService } from './external-feeds.service';
import { ExternalFeedsController } from './external-feeds.controller';
// import { TwitterRateLimiterService } from './twitter-rate-limiter.service'; // ⬅️ インポートをコメントアウト

import { MembersModule } from '../members/members.module'; 
import { ActivityLogsModule } from '../activity-logs/activity-logs.module'; 

@Module({
  imports: [
    MembersModule, 
    ActivityLogsModule,
  ],
  controllers: [ExternalFeedsController],
  providers: [
    ExternalFeedsService,
    // 🚨 修正: TwitterRateLimiterService を削除
    // TwitterRateLimiterService 
  ],
  exports: [
    ExternalFeedsService, 
    // 🚨 修正: TwitterRateLimiterService を削除
    // TwitterRateLimiterService 
  ],
})
export class ExternalFeedsModule {}