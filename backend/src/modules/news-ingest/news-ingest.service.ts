import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { PostType } from 'src/enums/post-type.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash } from 'crypto';

@Injectable()
export class NewsIngestService {
  private readonly logger = new Logger(NewsIngestService.name);

  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_15_MINUTES)
  async pollRss() {
    await this.pullAndCreate();
  }

  async onModuleInit() {
    await this.pullAndCreate();
  }

  private hash(link: string) {
    return createHash('sha256').update(link).digest('hex');
  }

  private async fetchItems(): Promise<Array<{ title: string; link: string }>> {
    const feeds = (process.env.RSS_FEEDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const items: Array<{ title: string; link: string }> = [];
    for (const url of feeds) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const xml = await res.text();
        const itemRegex = /<item[\s\S]*?<\/item>/g;
        const titleRegex = /<title>([\s\S]*?)<\/title>/;
        const linkRegex = /<link>([\s\S]*?)<\/link>/;
        const matches = xml.match(itemRegex) || [];
        for (const m of matches) {
          const title = (m.match(titleRegex)?.[1] || '').trim();
          const link = (m.match(linkRegex)?.[1] || '').trim();
          if (title && link) items.push({ title, link });
        }
      } catch {
        // ignore feed error
      }
    }
    return items;
  }

  private async systemUserId(): Promise<string> {
    const sys = await this.users.findOne({ where: { email: 'system@news.local' } });
    return sys?.id || '00000000-0000-0000-0000-000000000000';
  }

  async pullAndCreate() {
    const items = await this.fetchItems();
    if (!items.length) return;

    const existing = await this.posts
      .createQueryBuilder('p')
      .where('p.type = :type', { type: PostType.NEWS })
      .select(['p.id', 'p.content'])
      .getMany();

    const hashes = new Set<string>();
    for (const p of existing) {
      const match = p.content?.match(/link_hash:([a-f0-9]{64})/);
      if (match?.[1]) hashes.add(match[1]);
    }

    let created = 0;
    for (const item of items) {
      const h = this.hash(item.link);
      if (hashes.has(h)) continue;
      const content = `RSSニュース\nリンク: ${item.link}\nlink_hash:${h}`;
      const post = this.posts.create({
        authorUserId: await this.systemUserId(),
        type: PostType.NEWS,
        title: item.title,
        content,
        mediaIds: null,
        regionId: null,
      });
      await this.posts.save(post);
      hashes.add(h);
      created++;
    }

    if (created > 0) {
      this.logger.log(`News ingested: created ${created} posts`);
    }
  }
}