'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoteButtonProps {
  pledgeId: string;
  onVoteUpdate: (counts: { support: number; oppose: number; total: number }) => void;
  initialCounts: {
    support: number;
    oppose: number;
    total: number;
  };
}

export default function VoteButton({ pledgeId, onVoteUpdate, initialCounts }: VoteButtonProps) {
  const { user } = useAuth();
  const [currentVote, setCurrentVote] = useState<'support' | 'oppose' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (voteType: 'support' | 'oppose') => {
    if (!user) {
      toast.error('投票するにはログインが必要です');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      let response;
      
      if (currentVote === voteType) {
        // 同じ投票を再度押した場合は投票を取り消し
        response = await api.delete(`/votes/pledge/${pledgeId}`);
        setCurrentVote(null);
        setHasVoted(false);
        toast.success('投票を取り消しました');
      } else if (currentVote) {
        // 既存の投票を変更
        response = await api.patch(`/votes/pledge/${pledgeId}`, { voteType });
        setCurrentVote(voteType);
        toast.success(`投票を${voteType === 'support' ? '賛成' : '反対'}に変更しました`);
      } else {
        // 新しい投票
        response = await api.post('/votes', {
          pledgeId,
          voteType
        });
        setCurrentVote(voteType);
        setHasVoted(true);
        toast.success(`${voteType === 'support' ? '賛成' : '反対'}に投票しました`);
      }

      // 投票結果を更新
      if (response.data) {
        onVoteUpdate({
          support: response.data.supportCount || initialCounts.support,
          oppose: response.data.opposeCount || initialCounts.oppose,
          total: response.data.voteCount || initialCounts.total
        });
      }
    } catch (error: any) {
      console.error('Vote error:', error);
      
      if (error.response?.status === 409) {
        toast.error('この公約には既に投票済みです');
      } else if (error.response?.status === 401) {
        toast.error('ログインが必要です');
      } else {
        toast.error('投票に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">投票するにはログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">この公約についてどう思いますか？</p>
      </div>
      
      <div className="flex space-x-4">
        {/* Support Button */}
        <button
          onClick={() => handleVote('support')}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
            currentVote === 'support'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsUp className={`w-5 h-5 mr-2 ${currentVote === 'support' ? 'text-green-600' : 'text-gray-500'}`} />
          <span className="font-medium">賛成</span>
          {currentVote === 'support' && <Check className="w-4 h-4 ml-2 text-green-600" />}
        </button>

        {/* Oppose Button */}
        <button
          onClick={() => handleVote('oppose')}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
            currentVote === 'oppose'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsDown className={`w-5 h-5 mr-2 ${currentVote === 'oppose' ? 'text-red-600' : 'text-gray-500'}`} />
          <span className="font-medium">反対</span>
          {currentVote === 'oppose' && <Check className="w-4 h-4 ml-2 text-red-600" />}
        </button>
      </div>

      {hasVoted && (
        <div className="text-center">
          <p className="text-sm text-green-600 flex items-center justify-center">
            <Check className="w-4 h-4 mr-1" />
            投票完了
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">処理中...</span>
          </div>
        </div>
      )}
    </div>
  );
}
