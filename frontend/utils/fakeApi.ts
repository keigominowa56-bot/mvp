// frontend/utils/fakeApi.ts

import { Post } from '../types/data';

// ----------------------------------------------------
// 1. サンプルデータに投票数と投票状態を追加
// ----------------------------------------------------

// 💡 投稿データの構造を拡張
const samplePosts: Post[] = [
  {
    id: 'p1',
    author: {
      id: 'u1',
      username: '田中_市議会に期待',
      prefecture: '東京都',
      ageGroup: '30代',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
    content: '駅前の再開発計画について、もっと住民の声を聞くべきだと思います。特に商業施設の誘致は慎重に！',
    imageUrl: null,
    createdAt: '2025-11-10T10:00:00Z',
    commentCount: 5,
    // 💡 変更点: いいねから賛否投票に変更
    upvoteCount: 15, // 賛成票
    downvoteCount: 3, // 反対票
    // 💡 変更点: ユーザーの投票状態 (upvote, downvote, none)
    userVoteStatus: 'none', 
  },
  {
    id: 'p2',
    author: {
      id: 'u2',
      username: '環境派の市民',
      prefecture: '大阪府',
      ageGroup: '40代',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    content: '公園の整備予算を増やす公約に賛成です。子どもたちの遊び場は最優先事項だと思います。',
    imageUrl: 'https://picsum.photos/600/300',
    createdAt: '2025-11-09T15:30:00Z',
    commentCount: 12,
    upvoteCount: 42, 
    downvoteCount: 8, 
    userVoteStatus: 'upvote', 
  },
  // ... (必要に応じて他の投稿を追加)
];

// ----------------------------------------------------
// 2. タイムラインデータの取得
// ----------------------------------------------------

/**
 * タイムラインの投稿データを取得する（フェイクAPI）
 */
export async function fetchTimelineData(): Promise<Post[]> {
  // サーバーサイドでの処理をシミュレートするため、200msの遅延
  await new Promise(resolve => setTimeout(resolve, 200)); 
  return samplePosts;
}

// ----------------------------------------------------
// 3. 投稿の作成
// ----------------------------------------------------

/**
 * 新しい投稿を作成する（フェイクAPI）
 */
export async function createPost(content: string, imageUrl: string | null): Promise<Post> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newPost: Post = {
    id: `p${Date.now()}`,
    author: {
      id: 'u999',
      username: '現在のユーザー',
      prefecture: '未設定',
      ageGroup: '未設定',
      avatarUrl: null,
    },
    content: content,
    imageUrl: imageUrl,
    createdAt: new Date().toISOString(),
    commentCount: 0,
    // 💡 変更点: 初期投票数を設定
    upvoteCount: 0, 
    downvoteCount: 0, 
    userVoteStatus: 'none',
  };
  
  samplePosts.unshift(newPost); // リストの先頭に追加
  return newPost;
}


// ----------------------------------------------------
// 4. 賛否投票の処理 (いいね機能の置き換え)
// ----------------------------------------------------

type VoteType = 'upvote' | 'downvote' | 'none';

/**
 * 投稿の賛否投票を切り替える（フェイクAPI）
 * @param postId 対象の投稿ID
 * @param newStatus ユーザーが押したボタンの種類 ('upvote' または 'downvote')
 * @returns 更新後の投票数とユーザーの新しい投票状態
 */
export async function toggleVote(postId: string, newStatus: 'upvote' | 'downvote'): Promise<{ newUpvoteCount: number; newDownvoteCount: number; newUserVoteStatus: VoteType }> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const post = samplePosts.find(p => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }

  let upvoteChange = 0;
  let downvoteChange = 0;
  let finalStatus: VoteType = 'none';

  // 1. 現在の投票状態を確認
  const currentStatus = post.userVoteStatus;
  
  if (newStatus === 'upvote') {
    if (currentStatus === 'upvote') {
      // 既に賛成 -> 投票を取り消し
      upvoteChange = -1;
      finalStatus = 'none';
    } else if (currentStatus === 'downvote') {
      // 反対から賛成へ変更
      upvoteChange = 1;
      downvoteChange = -1;
      finalStatus = 'upvote';
    } else {
      // 未投票 -> 賛成
      upvoteChange = 1;
      finalStatus = 'upvote';
    }
  } else if (newStatus === 'downvote') {
    if (currentStatus === 'downvote') {
      // 既に反対 -> 投票を取り消し
      downvoteChange = -1;
      finalStatus = 'none';
    } else if (currentStatus === 'upvote') {
      // 賛成から反対へ変更
      upvoteChange = -1;
      downvoteChange = 1;
      finalStatus = 'downvote';
    } else {
      // 未投票 -> 反対
      downvoteChange = 1;
      finalStatus = 'downvote';
    }
  }

  // 2. データを更新
  post.upvoteCount += upvoteChange;
  post.downvoteCount += downvoteChange;
  post.userVoteStatus = finalStatus;

  // 3. 結果を返す
  return {
    newUpvoteCount: post.upvoteCount,
    newDownvoteCount: post.downvoteCount,
    newUserVoteStatus: finalStatus,
  };
}

// ----------------------------------------------------
// 5. 新しい投稿型をエクスポート
// ----------------------------------------------------

/**
 * 投稿型に新しいフィールドが追加されたため、Post型も再定義する必要がある
 * 実際には '@/types/data'で定義されているが、ここではローカルで再定義する
 */
export type { Post } from '../types/data';