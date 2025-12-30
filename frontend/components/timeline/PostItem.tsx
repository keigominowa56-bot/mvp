// frontend/components/timeline/PostItem.tsx

'use client';

import React, { useState } from 'react'; 
import { Post, toggleReaction, ReactionType } from '../../lib/api'; 
import { MessageCircle, MoreVertical, Loader2 } from 'lucide-react'; 
import { toast } from 'react-hot-toast';

type VoteType = 'upvote' | 'downvote' | 'none';

interface PostItemProps {
  post: Post;
}

// =======================================================
// ArrowUp/DownのSVGコンポーネント定義 (埋め込み)
// =======================================================
const UpArrowSVG = (props: { className?: string, fill?: string, isVoting?: boolean }) => {
    if (props.isVoting) {
        return <Loader2 size={18} className="animate-spin" />;
    }
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={props.fill || 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
            <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
        </svg>
    );
};

const DownArrowSVG = (props: { className?: string, fill?: string, isVoting?: boolean }) => {
    if (props.isVoting) {
        return <Loader2 size={18} className="animate-spin" />;
    }
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={props.fill || 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
            <path d="m19 12-7 7-7-7"/><path d="M12 5v14"/>
        </svg>
    );
};
// =======================================================


export default function PostItem({ post: initialPost }: PostItemProps) {
  const [post, setPost] = useState(initialPost);
  const [isVoting, setIsVoting] = useState(false); 

  const defaultAvatar = 'https://via.placeholder.com/40/FFFFFF/808080?text=U'; 

  /**
   * 賛否投票の状態を切り替えるハンドラ
   */
  const handleVoteToggle = async (voteDirection: 'upvote' | 'downvote') => {
    if (isVoting) return; 

    // Optimistic Update: UIを即時更新
    const previousPost = post;
    setIsVoting(true);

    const currentStatus = post.userVoteStatus;
    const isUpvote = voteDirection === 'upvote';
    const isDownvote = voteDirection === 'downvote';

    let newUp = post.upvoteCount ?? 0;
    let newDown = post.downvoteCount ?? 0;
    let newStatus: VoteType = 'none';

    if (isUpvote) {
        if (currentStatus === 'upvote') { newUp--; newStatus = 'none'; }
        else if (currentStatus === 'downvote') { newUp++; newDown--; newStatus = 'upvote'; }
        else { newUp++; newStatus = 'upvote'; }
    } else if (isDownvote) {
        if (currentStatus === 'downvote') { newDown--; newStatus = 'none'; }
        else if (currentStatus === 'upvote') { newUp--; newDown++; newStatus = 'downvote'; }
        else { newDown++; newStatus = 'downvote'; }
    }

    setPost(prev => ({
        ...prev,
        upvoteCount: newUp,
        downvoteCount: newDown,
        userVoteStatus: newStatus,
    }));


    try {
        // 'upvote' -> 'agree', 'downvote' -> 'disagree' にマッピング
        const reactionType: ReactionType = voteDirection === 'upvote' ? 'agree' : 'disagree';
        const result = await toggleReaction(post.id, reactionType);
        
        setPost(prev => ({
            ...prev,
            upvoteCount: result.summary.agree,
            downvoteCount: result.summary.disagree,
            userVoteStatus: result.reaction === 'agree' ? 'upvote' : result.reaction === 'disagree' ? 'downvote' : 'none',
        }));
    } catch (error) {
        setPost(previousPost);
        toast.error('投票の操作に失敗しました。');
    } finally {
        setIsVoting(false);
    }
  };


  const voteButtonBaseClass = "flex items-center space-x-1 transition-colors disabled:opacity-50";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-shadow hover:shadow-lg">
      
      {/* ユーザー情報とメタデータ */}
      <div className="flex justify-between items-start mb-3">
        {/* ... (中略: ユーザー情報) ... */}
        <div className="flex items-center space-x-3">
          <img 
            src={post.author?.avatarUrl || defaultAvatar} 
            alt={post.author?.username || 'ユーザー'} 
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
          />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{post.author?.username || '匿名ユーザー'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {post.author?.prefecture || '地域不明'} ({post.author?.ageGroup || '年代不明'}) • {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* 投稿内容 */}
      <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* 画像 */}
      {post.imageUrl && (
        <div className="mb-4">
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className="w-full max-h-80 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}

      {/* アクションと統計 (賛否投票エリア) */}
      <div className="flex items-center space-x-6 pt-3 pb-2 text-gray-500 dark:text-gray-400">
        
        {/* 💡 賛成ボタン (Upvote) - SVGコンポーネントを使用 */}
        <button 
          onClick={() => handleVoteToggle('upvote')} 
          disabled={isVoting} 
          className={`${voteButtonBaseClass} ${post.userVoteStatus === 'upvote' ? 'text-green-500' : 'hover:text-green-500'}`}
        >
          <UpArrowSVG 
              isVoting={isVoting && post.userVoteStatus !== 'upvote'}
              fill={post.userVoteStatus === 'upvote' ? 'currentColor' : 'none'} 
              className="w-[18px] h-[18px]" 
          />
          <span className="text-sm font-semibold">{post.upvoteCount ?? 0} 賛成</span>
        </button>

        {/* 💡 反対ボタン (Downvote) - SVGコンポーネントを使用 */}
        <button 
          onClick={() => handleVoteToggle('downvote')} 
          disabled={isVoting} 
          className={`${voteButtonBaseClass} ${post.userVoteStatus === 'downvote' ? 'text-red-500' : 'hover:text-red-500'}`}
        >
           <DownArrowSVG 
              isVoting={isVoting && post.userVoteStatus !== 'downvote'}
              fill={post.userVoteStatus === 'downvote' ? 'currentColor' : 'none'} 
              className="w-[18px] h-[18px]" 
          />
          <span className="text-sm font-semibold">{post.downvoteCount ?? 0} 反対</span>
        </button>

        {/* コメントボタン */}
        <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
          <MessageCircle size={18} />
          <span className="text-sm">{post.commentCount ?? 0} コメント</span>
        </button>

      </div>
    </div>
  );
}