/**
 * 活動ログのソースタイプ
 */
export enum ActivityLogType {
  /** 手動投稿 */
  MANUAL = 'manual',
  
  /** Twitter からの収集 */
  TWITTER = 'twitter',
  
  /** RSS フィードからの収集 */
  RSS = 'rss',
  
  /** 公式サイトからの収集 */
  OFFICIAL = 'official',
}
