// frontend/app/admin/approval/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { ExternalLink, Check, X, Loader2, BarChart, Clock, Hash, Zap } from 'lucide-react';

// --- 型定義 (バックエンドのActivityLog Entityに基づく) ---
interface ActivityLog {
  id: string;
  memberId: string;
  source: 'twitter' | 'rss' | 'official' | 'manual';
  content: string;
  isPublic: boolean;
  publishedAt: string;
  metadata: {
    url?: string;
    isPolitical?: boolean;
    isNoise?: boolean;
    [key: string]: any;
  };
  member: {
    id: string;
    name: string;
    affiliation: string;
    position: string;
    twitterHandle?: string;
  };
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  approvalRate: number;
  politicalCount: number;
  noiseCount: number;
}

// --- APIクライアント (適切なAPI URLを設定) ---
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api', 
});

// --- 主要コンポーネント ---

const ApprovalPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // フィルター状態
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('pending');
  const [filterSource, setFilterSource] = useState<'all' | 'twitter' | 'rss' | 'official' | 'manual'>('all');
  
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (filterStatus === 'pending') {
        endpoint = '/activity-logs/pending';
      } else if (filterStatus === 'approved') {
        endpoint = '/activity-logs/all?includePrivate=true'; // isPublic=true のみをフロントでフィルター
      } else {
        endpoint = '/activity-logs/all?includePrivate=true';
      }
      
      // バックエンドがページネーションを返すことを想定
      const response = await api.get(endpoint, { params: { limit: 100 } });
      let fetchedLogs = response.data.data || response.data;

      // フロントエンドでのステータスフィルター
      if (filterStatus === 'approved') {
        fetchedLogs = fetchedLogs.filter((log: ActivityLog) => log.isPublic);
      }
      
      setLogs(fetchedLogs);
    } catch (e) {
      setError('ログの取得に失敗しました。バックエンドが起動しているか確認してください。');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/activity-logs/stats');
      setStats(response.data);
    } catch (e) {
      console.error('統計情報の取得に失敗しました。', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, filterStatus]);
  
  // --- アクションハンドラー (Line 121-147) ---
  const handleApprove = async (logId: string) => {
    try {
      await api.patch(`/activity-logs/${logId}/approve`);
      // 承認後、リストから削除して再フェッチ
      setLogs(prev => prev.filter(log => log.id !== logId));
      fetchStats(); // 統計情報も更新
    } catch (e) {
      alert('承認処理に失敗しました。');
    }
  };

  const handleReject = async (logId: string) => {
    try {
      await api.patch(`/activity-logs/${logId}/reject`);
      // 非承認後、リストから削除して再フェッチ
      setLogs(prev => prev.filter(log => log.id !== logId));
      fetchStats(); // 統計情報も更新
    } catch (e) {
      alert('非承認処理に失敗しました。');
    }
  };
  
  const handleBatchApprove = async () => {
    const pendingLogs = filteredLogs.filter(log => !log.isPublic).map(log => log.id);
    if (pendingLogs.length === 0) return;
    
    try {
      await api.patch('/activity-logs/bulk/approve', { ids: pendingLogs });
      alert(`${pendingLogs.length}件を一括承認しました。`);
      fetchLogs();
      fetchStats();
    } catch (e) {
      alert('一括承認処理に失敗しました。');
    }
  };
  
  // --- フィルタリングと表示 (Line 184-232) ---
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // ソースフィルター
      if (filterSource !== 'all' && log.source !== filterSource) {
        return false;
      }
      // ステータスフィルターはfetchLogs内で処理済みだが、念のため。
      return true;
    });
  }, [logs, filterSource]);
  
  if (loading && !logs.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-100 rounded">{error}</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">活動ログ承認管理</h1>

      {/* 統計ダッシュボード (Line 152-182) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="合計ログ数" value={stats.total} icon={<Hash className="w-6 h-6" />} />
          <StatCard title="承認済み" value={stats.approved} icon={<Check className="w-6 h-6 text-green-500" />} />
          <StatCard title="承認待ち" value={stats.pending} icon={<Clock className="w-6 h-6 text-yellow-500" />} />
          <StatCard title="承認率" value={`${stats.approvalRate}%`} icon={<BarChart className="w-6 h-6 text-blue-500" />} />
          <StatCard title="自動承認 (政治関連)" value={stats.politicalCount} icon={<Zap className="w-6 h-6 text-indigo-500" />} />
          <StatCard title="ノイズ判定数" value={stats.noiseCount} icon={<X className="w-6 h-6 text-red-500" />} />
        </div>
      )}

      {/* フィルターとアクション */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-lg shadow">
        <div className="flex space-x-4 mb-4 md:mb-0">
          <FilterButton 
            label="承認待ち" 
            isActive={filterStatus === 'pending'} 
            onClick={() => setFilterStatus('pending')} 
            count={stats?.pending || 0}
          />
          <FilterButton 
            label="承認済み" 
            isActive={filterStatus === 'approved'} 
            onClick={() => setFilterStatus('approved')} 
            count={stats?.approved || 0}
          />
          <FilterButton 
            label="すべて" 
            isActive={filterStatus === 'all'} 
            onClick={() => setFilterStatus('all')} 
            count={stats?.total || 0}
          />
        </div>

        <div className="flex space-x-4">
          <select 
            className="p-2 border rounded-md"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as any)}
          >
            <option value="all">ソース: すべて</option>
            <option value="twitter">ソース: Twitter</option>
            <option value="rss">ソース: RSS</option>
            <option value="official">ソース: 公式</option>
            <option value="manual">ソース: 手動</option>
          </select>
          
          <button
            onClick={handleBatchApprove}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50"
            disabled={filteredLogs.filter(log => !log.isPublic).length === 0}
          >
            一括承認 ({filteredLogs.filter(log => !log.isPublic).length})
          </button>
        </div>
      </div>

      {/* ログ一覧 */}
      <div className="space-y-4">
        {filteredLogs.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
            表示するログはありません。
          </div>
        )}
        {filteredLogs.map(log => (
          <LogCard 
            key={log.id} 
            log={log} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            canApprove={filterStatus === 'pending'}
          />
        ))}
      </div>
    </div>
  );
};

// --- サブコンポーネント ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="p-4 bg-white rounded-lg shadow flex items-center space-x-4">
    <div className="text-blue-500">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; count: number }> = ({ label, isActive, onClick, count }) => (
  <button
    className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={onClick}
  >
    {label} ({count})
  </button>
);

const LogCard: React.FC<{ log: ActivityLog; onApprove: (id: string) => void; onReject: (id: string) => void; canApprove: boolean }> = ({ log, onApprove, onReject, canApprove }) => {
  const isPending = !log.isPublic;
  const isPolitical = log.metadata.isPolitical;
  const isNoise = log.metadata.isNoise;

  return (
    <div className={`p-5 rounded-xl shadow-lg transition duration-200 ${
      isPending ? 'bg-white border-l-4 border-yellow-500' : 
      log.isPublic ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-semibold text-gray-800">
            {log.member.name} ({log.member.affiliation})
          </p>
          <p className="text-sm text-gray-500 mb-2">
            {log.member.position} | {dayjs(log.publishedAt).format('YYYY/MM/DD HH:mm')} | <span className="uppercase font-mono">{log.source}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          {isPolitical && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">政治関連 (自動承認)</span>}
          {isNoise && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">ノイズ判定</span>}
          {log.metadata.url && (
            <Link href={log.metadata.url} target="_blank" className="text-blue-500 hover:text-blue-600 transition">
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <p className="mt-3 text-gray-700 whitespace-pre-wrap">{log.content}</p>
      
      {isPending && canApprove && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
          <button
            onClick={() => onApprove(log.id)}
            className="flex items-center px-3 py-1 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition"
          >
            <Check className="w-4 h-4 mr-1" /> 承認
          </button>
          <button
            onClick={() => onReject(log.id)}
            className="flex items-center px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition"
          >
            <X className="w-4 h-4 mr-1" /> 非承認
          </button>
        </div>
      )}
    </div>
  );
};

export default ApprovalPage;