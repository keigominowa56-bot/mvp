import { Injectable } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

export type ExternalTweet = {
  id: string;
  text: string;
  created_at: string;
};

@Injectable()
export class ExternalFeedsService {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * 外部ツイート配列を ActivityLog に格納
   * @param memberId ログ対象の Member ID
   * @param tweets 外部から取得したツイート配列
   */
  async importTweets(memberId: string, tweets: ExternalTweet[]) {
    for (const tweet of tweets) {
      // 既存登録チェック
      const exists = await this.activityLogsService.findByExternalId(tweet.id);
      if (exists) continue;

      await this.activityLogsService.create({
        memberId,
        type: 'external_feed_import',
        detail: tweet.text,
        source: 'twitter',
        externalId: tweet.id,
        publishedAt: new Date(tweet.created_at),
      });
    }
    return { imported: tweets.length };
  }
}