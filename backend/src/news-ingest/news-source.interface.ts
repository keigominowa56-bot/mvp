export type NewsItem = {
  title: string;
  link: string;
  content?: string;
  publishedAt?: Date | null;
  source?: string;
};

export interface NewsSource {
  fetch(): Promise<NewsItem[]>;
}