// frontend/types/data.ts

/** ユーザー情報 */
export interface User {
  id: string; // UUID
  email: string; // メールアドレス
  displayName: string | null;
  role: 'admin' | 'user'; // ロール
  firebaseUid: string | null;
  photoUrl: string | null;
  district: string | null; // 地域
  
  // 💡 統合: タイムライン/本人確認に必要な属性
  prefecture: string | null; // ユーザーの居住都道府県
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s+' | 'Unknown' | null; // 年齢層

  isActive: boolean;
  createdAt: string; // Dateオブジェクトとして扱うことが多いですが、APIから文字列で返ることを想定しstring
  updatedAt: string;
}

/** 議員情報 */
export interface Member {
  id: string; // UUID
  name: string; // 議員名
  twitterHandle: string | null;
  email: string | null;
  affiliation: string | null; // 所属政党
  position: string | null; // 役職
  userId: string | null; // 関連ユーザーID
  blogRssUrl: string | null;
  officialRssUrl: string | null;
  lastTwitterFetch: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 公約情報 */
export interface Pledge {
  id: string; // UUID
  memberId: string; // 議員ID
  title: string; // 公約タイトル
  description: string | null;
  category: string | null; // カテゴリ
  status: 'pending' | 'in_progress' | 'completed' | 'failed'; // ステータス
  createdAt: string;
  updatedAt: string;
}

/** 投票情報 */
export interface Vote {
  id: string; // UUID
  userId: string; // 投票者ID
  pledgeId: string; // 公約ID
  memberId: string; // 議員ID
  voteType: 'agree' | 'disagree'; // 投票タイプ
  createdAt: string;
}

/** 活動ログ情報 */
export interface ActivityLog {
  id: string; // UUID
  memberId: string; // 議員ID
  title: string; // タイトル
  content: string | null; // 内容
  source: 'twitter' | 'rss' | 'manual'; // ソース
  sourceUrl: string | null; // ソースURL
  publishedAt: string;
  createdAt: string;
}

/** 政務活動費情報 */
export interface ActivityFund {
  id: string; // UUID
  memberId: string; // 議員ID
  category: string; // カテゴリ (交通費、事務所費など)
  amount: number; // 金額
  description: string | null;
  date: string; // 支出日
  createdAt: string;
}

/** API応答の共通エラー型 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// -----------------------------------------------------------
// 📌 タイムライン機能用 新しい型定義
// -----------------------------------------------------------

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s+' | 'Unknown';

/**
 * 投稿 (Post) の型定義
 * 投稿内容と投稿者情報を含む
 */
export interface Post {
    id: string;
    content: string; // 投稿本文
    imageUrl: string | null; // 添付画像があればそのURL
    
    // 投稿者情報 (ネスト) - タイムライン表示に必要な情報のみ
    author: {
        id: string;
        username: string;
        avatarUrl: string | null;
        
        // 投稿と関連付けたい本人確認属性情報
        prefecture: string | null; 
        ageGroup: AgeGroup | null;
    };
    
    // インタラクション (いいね、コメント)
    likeCount: number; 
    commentCount: number; 
    isLiked: boolean; // ログインユーザーが「いいね」しているか
    
    // 賛否投票
    upvoteCount: number;
    downvoteCount: number;
    userVoteStatus: 'upvote' | 'downvote' | 'none'; // ログインユーザーの投票状態
    
    // タイムスタンプ
    createdAt: string; 
    updatedAt: string; 
}

/**
 * タイムライン表示用のデータ構造
 * ページネーションを考慮
 */
export interface TimelineData {
    posts: Post[]; // 投稿のリスト
    hasNextPage: boolean; // 次のページがあるか
    nextCursor: string | null; // 次のページ取得のためのカーソル値
    totalCount: number; // 全投稿数
}