import { NewsItem, NewsSource } from './news-source.interface';

export class RssNewsSource implements NewsSource {
  constructor(private readonly feedUrls: string[], private readonly sourceName = 'RSS') {}

  async fetch(): Promise<NewsItem[]> {
    // 簡易実装：各フィードURLをfetchし、非常に簡易なXMLパース（本番は rss-parser を推奨）
    const items: NewsItem[] = [];
    for (const url of this.feedUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const xml = await res.text();

        // 超簡易パース（<item><title>... を抜く）。正確なRSS対応は rss-parser を利用してください。
        const itemRegex = /<item[\s\S]*?<\/item>/g;
        const titleRegex = /<title>([\s\S]*?)<\/title>/;
        const linkRegex = /<link>([\s\S]*?)<\/link>/;
        const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;

        const matches = xml.match(itemRegex) || [];
        for (const m of matches) {
          const title = (m.match(titleRegex)?.[1] || '').trim();
          const link = (m.match(linkRegex)?.[1] || '').trim();
          const pubDateStr = (m.match(pubDateRegex)?.[1] || '').trim();
          const publishedAt = pubDateStr ? new Date(pubDateStr) : null;

          if (title && link) {
            items.push({ title, link, publishedAt, source: this.sourceName });
          }
        }
      } catch {
        // フィード取得失敗はスキップ
        continue;
      }
    }
    return items;
  }
}