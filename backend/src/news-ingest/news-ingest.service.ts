import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PostType } from '../../enums/post-type.enum';
import { User } from '../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { NewsItem } from './news-source.interface';
import { RssNewsSource } from './rss-news.source';

@Injectable()
export class NewsIngestService {
  private readonly logger = new Logger(NewsIngestService.name);
  private readonly source: RssNewsSource;
  private readonly cronExpr: string;

  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly cfg: ConfigService,
  ) {
    const feeds = (cfg.get<string>('RSS_FEEDS') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const sourceName = cfg.get<string>('NEWS_SOURCE_NAME') || 'RSS';
    this.source = new RssNewsSource(feeds, sourceName);
    this.cronExpr = cfg.get<string>('NEWS_INGEST_INTERVAL_CRON') || CronExpression.EVERY_15_MINUTES;
  }

  // 動的cronはデコレータでは設定できないため、初回起動時に手動トリガや外部スケジューラを使うのが一般的。
  // ここでは固定のEVERY_15_MINUTESをデコレータに使いつつ、環境変数が異なる場合は起動時に即時実行します。
  @Cron(CronExpression.EVERY_15_MINUTES)
  async scheduledPull() {
    await this.pullAndCreate();
  }

  async onModuleInit() {
    // 起動直後に一度取得しておく
    await this.pullAndCreate();
  }

  private makeHash(link: string) {
    return createHash('sha256').update(link).digest('hex');
  }

  async pullAndCreate() {
    const items = await this.source.fetch();
    if (!items.length) return;

    // 重複排除用に既存ニュースのリンクハッシュを抽出
    // ここでは posts.title や content にハッシュを埋め込む簡易実装。実運用は別テーブル/カラムを推奨。
    const existing = await this.posts
      .createQueryBuilder('p')
      .where('p.type = :type', { type: PostType.NEWS })
      .select(['p.id', 'p.content'])
      .getMany();

    const existingHashes = new Set<string>();
    for (const p of existing) {
      const match = p.content?.match(/link_hash:([a-f0-9]{64})/);
      if (match?.[1]) existingHashes.add(match[1]);
    }

    let createdCount = 0;
    for (const item of items) {
      const hash = this.makeHash(item.link);
      if (existingHashes.has(hash)) continue;

      const content = `${item.source || 'RSS'} からのニュース\nリンク: ${item.link}\nlink_hash:${hash}`;
      const post = this.posts.create({
        authorUserId: await this.resolveSystemUserId(),
        type: PostType.NEWS,
        title: item.title,
        content,
        mediaIds: null,
        regionId: null,
      });
      await this.posts.save(post);
      existingHashes.add(hash);
      createdCount++;
    }

    if (createdCount > 0) {
      this.logger.log(`News ingested: created ${createdCount} posts`);
    }
  }

  // ニュースはシステムユーザー名義で投稿する想定
  private async resolveSystemUserId(): Promise<string> {
    // システムユーザーが無ければNULLのままでも可（FKが必須なら別途作成）
    const sys = await this.users.findOne({ where: { email: 'system@news.local' } });
    return sys?.id || '00000000-0000-0000-0000-000000000000';
  }
}