'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ThumbsUp, ThumbsDown, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import VoteButton from './VoteButton';

interface Pledge {
  id: string;
  title: string;
  description: string;
  category?: string;
  targetDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  voteCount: number;
  supportCount: number;
  opposeCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PledgeCardProps {
  pledge: Pledge;
  showVoting?: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: '未着手',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200'
  },
  in_progress: {
    icon: AlertCircle,
    label: '進行中',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200'
  },
  completed: {
    icon: CheckCircle,
    label: '完了',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  cancelled: {
    icon: XCircle,
    label: '中止',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }
};

export default function PledgeCard({ pledge, showVoting = false }: PledgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [voteCounts, setVoteCounts] = useState({
    support: pledge.supportCount,
    oppose: pledge.opposeCount,
    total: pledge.voteCount
  });

  const status = statusConfig[pledge.status];
  const StatusIcon = status.icon;

  const supportPercentage = voteCounts.total > 0 ? (voteCounts.support / voteCounts.total * 100).toFixed(1) : '0';
  const opposePercentage = voteCounts.total > 0 ? (voteCounts.oppose / voteCounts.total * 100).toFixed(1) : '0';

  const handleVoteUpdate = (newCounts: { support: number; oppose: number; total: number }) => {
    setVoteCounts(newCounts);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-lg border-l-4 ${status.borderColor} overflow-hidden hover:shadow-xl transition-shadow duration-300`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {pledge.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className={`flex items-center px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                <span className="font-medium">{status.label}</span>
              </div>
              {pledge.category && (
                <div className="flex items-center text-gray-500">
                  <Tag className="w-4 h-4 mr-1" />
                  <span>{pledge.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className={`text-gray-700 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {pledge.description}
          </p>
          {pledge.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              {isExpanded ? '折りたたむ' : '続きを読む'}
            </button>
          )}
        </div>

        {/* Target Date */}
        {pledge.targetDate && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            <span>目標日: {new Date(pledge.targetDate).toLocaleDateString('ja-JP')}</span>
          </div>
        )}

        {/* Voting Section */}
        {showVoting && (
          <div className="mb-4">
            <VoteButton 
              pledgeId={pledge.id} 
              onVoteUpdate={handleVoteUpdate}
              initialCounts={{
                support: pledge.supportCount,
                oppose: pledge.opposeCount,
                total: pledge.voteCount
              }}
            />
          </div>
        )}

        {/* Vote Results */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">投票結果</span>
            <span className="text-sm text-gray-600">{voteCounts.total}票</span>
          </div>
          
          <div className="space-y-2">
            {/* Support Bar */}
            <div className="flex items-center">
              <div className="flex items-center w-16 text-sm text-green-700">
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span>賛成</span>
              </div>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${supportPercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-700 w-16 text-right">
                {voteCounts.support}票 ({supportPercentage}%)
              </div>
            </div>

            {/* Oppose Bar */}
            <div className="flex items-center">
              <div className="flex items-center w-16 text-sm text-red-700">
                <ThumbsDown className="w-4 h-4 mr-1" />
                <span>反対</span>
              </div>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${opposePercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-700 w-16 text-right">
                {voteCounts.oppose}票 ({opposePercentage}%)
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>作成日: {new Date(pledge.createdAt).toLocaleDateString('ja-JP')}</span>
            <span>更新日: {new Date(pledge.updatedAt).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
