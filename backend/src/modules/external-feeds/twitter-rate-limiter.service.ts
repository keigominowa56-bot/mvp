// backend/src/modules/external-feeds/twitter-rate-limiter.service.ts

import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class TwitterRateLimiterService {
  private readonly logger = new Logger(TwitterRateLimiterService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkRateLimit(): Promise<void> {
    // 修正: undefinedの可能性を考慮
    const remaining = await this.cacheManager.get<number>('twitter:rate:remaining');
    const resetTime = await this.cacheManager.get<number>('twitter:rate:reset');

    // remainingがnullやundefinedでなく、5以下の場合に警告
    if (remaining !== null && remaining !== undefined && remaining <= 5) {
      // resetTimeがnullやundefinedでなく、数値であることを確認
      if (resetTime !== null && resetTime !== undefined) {
        const waitTime = resetTime - Date.now() / 1000;
        if (waitTime > 0) {
          this.logger.warn(`Twitter APIのレート制限に近づいています。${Math.ceil(waitTime)}秒待機します。`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
      }
    }
  }
}