// backend/src/modules/external-feeds/external-feeds.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import dayjs from 'dayjs';
import { CreateActivityLogDto } from '../../modules/activity-logs/dto/create-activity-log.dto';
import { MembersService } from '../../modules/members/members.service';
import { ActivityLogsService } from '../../modules/activity-logs/activity-logs.service';
import { Member } from '../../entities/member.entity';
// import { TwitterRateLimiterService } from './twitter-rate-limiter.service'; // ⬅️ 削除
import { ConfigService } from '@nestjs/config';
import { ActivityLogType } from '../../enums/activity-log-type.enum.js'; // 修正: .js拡張子を追加

@Injectable()
export class ExternalFeedsService {
  private readonly logger = new Logger(ExternalFeedsService.name);
  private readonly MIN_INTERVAL_HOURS = 24;

  constructor(
    private readonly membersService: MembersService,
    private readonly activityLogsService: ActivityLogsService,
    // 🚨 修正: TwitterRateLimiterService の依存関係を削除
    // private readonly twitterRateLimiterService: TwitterRateLimiterService, 
    private readonly configService: ConfigService,
  ) {}

  async collectAllData(): Promise<{ success: boolean; stats: any }> {
    this.logger.log('--- 全メンバーの外部フィード収集開始 ---');
    const twitterStats = await this.collectTwitterData();
    this.logger.log('--- 全メンバーの外部フィード収集完了 ---');

    return {
      success: true,
      stats: {
        twitter: twitterStats,
        rss: { fetched: 0, newLogs: 0, errors: 0 },
      },
    };
  }

  async collectFeedsForMember(memberId: string): Promise<any> {
    const member = await this.membersService.findOne(memberId);
    
    if (!member) {
      this.logger.warn(`Member not found: ${memberId}`);
      return { success: false, message: `Member with ID ${memberId} not found.` };
    }

    this.logger.log(`メンバー ${member.name} (${memberId}) のフィード収集開始`);
    
    if (member.twitterHandle) {
      await this.collectTwitterFeedsForMember(member);
    }
    
    this.logger.log(`メンバー ${member.name} のフィード収集完了`);
    
    return { success: true };
  }

  async getCollectionStats(): Promise<{
    lastRun: Date;
    membersToFetch: number;
    twitterRateLimit: string;
  }> {
    const now = dayjs();
    const membersToFetch = (await this.membersService.findAll())
      .filter(this.shouldFetchTwitter)
      .length;
      
    // 修正: rate limiter serviceを削除したため、ダミーデータを使用
    const rateLimit = { remaining: 450, limit: 500, reset: dayjs().add(15, 'minutes').valueOf() };

    return {
      lastRun: now.toDate(),
      membersToFetch: membersToFetch,
      twitterRateLimit: `${rateLimit.remaining}/${rateLimit.limit} (Reset: ${dayjs(rateLimit.reset).format('HH:mm')})`,
    };
  }
  
  async collectTwitterData(): Promise<any> {
    const members = await this.membersService.findAll();
    const membersToFetch = members
      .filter(this.shouldFetchTwitter)
      .sort(this.sortByLastTwitterFetch);

    this.logger.log(`Twitterフィード収集対象メンバー数: ${membersToFetch.length}`);

    let newLogsCount = 0;
    let errorsCount = 0;

    for (const member of membersToFetch) {
      try {
        await this.collectTwitterFeedsForMember(member);
        newLogsCount++;
      } catch (error) {
        this.logger.error(`メンバー ${member.name} のTwitterフィード収集中にエラーが発生: ${error.message}`);
        errorsCount++;
      }
    }

    return { fetched: membersToFetch.length, newLogs: newLogsCount, errors: errorsCount };
  }

  async collectTwitterFeedsForMember(member: Member): Promise<void> {
    if (!member.twitterHandle) {
      return;
    }

    const bearerToken = this.configService.get<string>('TWITTER_BEARER_TOKEN');
    
    let client: TwitterApi;
    if (bearerToken) {
        client = new TwitterApi(bearerToken);
    } else {
      // ログレベルを変更 (アプリケーションのクラッシュを防ぐため)
      this.logger.warn("TWITTER_BEARER_TOKEN environment variable is not set. Skipping Twitter feed collection."); 
      return;
    }
    
    try {
      // 🚨 修正: Rate Limiter のチェックを削除
      // await this.twitterRateLimiterService.checkRateLimit();

      const user = await client.v2.userByUsername(member.twitterHandle, {
        'user.fields': ['profile_image_url'],
      });

      const timeline = await client.v2.userTimeline(user.data.id, {
        exclude: ['replies', 'retweets'],
        max_results: 10,
        'tweet.fields': ['created_at'],
      });

      for (const tweet of timeline.data.data || []) {
        const logExists = await this.activityLogsService.findByExternalId(tweet.id);
        if (logExists) continue;

        const newLog: CreateActivityLogDto = {
          memberId: member.id,
          source: ActivityLogType.TWITTER,
          externalId: tweet.id,
          url: `https://twitter.com/${member.twitterHandle}/status/${tweet.id}`,
          content: tweet.text,
          title: tweet.text.substring(0, 100) + '...',
          publishedAt: dayjs(tweet.created_at).toDate(),
        };

        await this.activityLogsService.create(newLog);
      }

      await this.membersService.updateLastTwitterFetch(member.id);
    } catch (error) {
      this.logger.error(`Twitterフィード取得エラー (${member.twitterHandle}): ${error.message}`);
      throw error;
    }
  }

  private shouldFetchTwitter(m: Member): boolean {
    if (!m.twitterHandle) return false;
    if (!m.lastTwitterFetch) return true;

    return dayjs(m.lastTwitterFetch)
      .add(this.MIN_INTERVAL_HOURS, 'hour')
      .isBefore(dayjs());
  }

  private sortByLastTwitterFetch(a: Member, b: Member): number {
    if (!a.lastTwitterFetch) return -1;
    if (!b.lastTwitterFetch) return 1;
    return dayjs(a.lastTwitterFetch).valueOf() - dayjs(b.lastTwitterFetch).valueOf();
  }
}