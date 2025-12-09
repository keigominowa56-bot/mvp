// frontend/app/(main)/members/[id]/page.tsx

'use client'; // 💡 修正: これをファイルの最初の行にのみ記述します

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { MapPin, Users, Briefcase, Link as LinkIcon, Twitter, Loader2, BookOpen, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// ----------------------------------------------------
// 1. データ型定義 (重複を削除し、一度だけ定義)
// ----------------------------------------------------

/**
 * 公約の情報型
 */
interface Pledge {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  supportCount: number;
  opposeCount: number;
}

/**
 * 活動記録の情報型
 */
interface ActivityLog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

/**
 * 議員の詳細情報型
 */
interface MemberDetail {
  id: string;
  name: string;
  photoUrl?: string;
  affiliation: string;
  district: string;
  party: string;
  position: string;
  biography: string;
  website?: string;
  twitterHandle?: string;
  pledges: Pledge[];
  activityLogs: ActivityLog[];
}


// ----------------------------------------------------
// 2. 議員詳細ページコンポーネント
// ----------------------------------------------------

export default function MemberDetailPage() {
  // Next.jsからURLの[id]の部分を取得します
  const params = useParams();
  const memberId = params.id as string;
  
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pledges' | 'activityLogs'>('pledges');

  // 議員データを取得する関数
  useEffect(() => {
    if (!memberId) return;

    const fetchMemberDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        // バックエンドの /members/[id] エンドポイントからデータを取得
        const response = await apiClient.get<MemberDetail>(`/members/${memberId}`);
        setMember(response.data);
      } catch (err) {
        console.error(`議員ID: ${memberId} の詳細データの取得に失敗:`, err);
        setError('議員データの読み込みに失敗しました。IDまたはサーバーを確認してください。');
        toast.error('議員の詳細情報を読み込めませんでした。');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetail();
  }, [memberId]);

  // ローディング表示
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">詳細データを読み込み中...</p>
      </div>
    );
  }

  // エラー表示
  if (error || !member) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
          <h1 className="text-2xl font-bold text-red-700 mb-2">エラー</h1>
          <p className="text-red-600">{error || '指定された議員が見つかりませんでした。'}</p>
        </div>
      </div>
    );
  }

  // データ表示
  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* 議員の基本情報セクション */}
      <MemberHeader member={member} />

      {/* タブ切り替えセクション */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <TabButton 
                isActive={activeTab === 'pledges'} 
                onClick={() => setActiveTab('pledges')} 
                count={member.pledges.length}
                icon={BookOpen}
                label="公約"
            />
            <TabButton 
                isActive={activeTab === 'activityLogs'} 
                onClick={() => setActiveTab('activityLogs')} 
                count={member.activityLogs.length}
                icon={Clock}
                label="活動記録"
            />
          </nav>
        </div>

        {/* タブの内容 */}
        <div className="mt-8">
          {activeTab === 'pledges' && <PledgeList pledges={member.pledges} />}
          {activeTab === 'activityLogs' && <ActivityLogList activityLogs={member.activityLogs} />}
        </div>
      </div>
      
    </div>
  );
}

// ----------------------------------------------------
// 3. ヘルパーコンポーネント
// ----------------------------------------------------

// 議員のヘッダー部分（名前、写真、基本情報）
const MemberHeader: React.FC<{ member: MemberDetail }> = ({ member }) => {
    // ダミーの画像URL
    const dummyPhotoUrl = `https://picsum.photos/seed/${member.id}/150/150`;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                
                {/* 写真 */}
                <img
                    src={member.photoUrl || dummyPhotoUrl}
                    alt={`${member.name} 議員の写真`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 shadow-md"
                />
                
                {/* 情報 */}
                <div className="flex-grow text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900">{member.name}</h1>
                    <p className="text-xl text-blue-600 font-semibold mb-3">{member.position}</p>
                    
                    {/* 基本情報グリッド */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-gray-600">
                        <InfoBadge icon={MapPin} label="選出区" value={member.district} />
                        <InfoBadge icon={Briefcase} label="所属会派" value={member.affiliation} />
                        <InfoBadge icon={Users} label="所属政党" value={member.party} />
                        {member.website && <InfoBadge icon={LinkIcon} label="Web" value={member.website} isLink />}
                        {member.twitterHandle && <InfoBadge icon={Twitter} label="Twitter" value={`@${member.twitterHandle}`} isLink linkUrl={`https://twitter.com/${member.twitterHandle}`} />}
                    </div>
                </div>
            </div>
            
            {/* 自己紹介 */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">自己紹介・経歴</h3>
                <p className="text-gray-700 whitespace-pre-line">{member.biography || '自己紹介文は準備中です。'}</p>
            </div>
        </div>
    );
};

// 情報バッジ（リンク対応）
const InfoBadge: React.FC<{ icon: React.ElementType, label: string, value: string, isLink?: boolean, linkUrl?: string }> = ({ icon: Icon, label, value, isLink = false, linkUrl }) => {
    const content = (
        <span className="flex items-center text-sm">
            <Icon className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-medium mr-1">{label}:</span>
            <span className={`font-semibold ${isLink ? 'text-blue-600 hover:underline' : 'text-gray-800'}`}>{value}</span>
        </span>
    );

    if (isLink) {
        return (
            <a href={linkUrl || value} target="_blank" rel="noopener noreferrer" className="truncate">
                {content}
            </a>
        );
    }
    return <div className="truncate">{content}</div>;
};

// タブボタン
const TabButton: React.FC<{ isActive: boolean, onClick: () => void, count: number, icon: React.ElementType, label: string }> = ({ isActive, onClick, count, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center px-1 py-3 text-lg font-medium transition-colors
            ${isActive
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
        `}
    >
        <Icon className="w-5 h-5 mr-2" />
        {label}
        <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none rounded-full ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {count}
        </span>
    </button>
);


// 公約リスト
const PledgeList: React.FC<{ pledges: Pledge[] }> = ({ pledges }) => {
    if (pledges.length === 0) {
        return (
            <div className="p-10 text-center bg-gray-100 rounded-lg border border-gray-200">
                <Zap className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">現在、登録されている公約はありません。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {pledges.map(pledge => (
                <PledgeCard key={pledge.id} pledge={pledge} />
            ))}
        </div>
    );
};

// 公約カード
const PledgeCard: React.FC<{ pledge: Pledge }> = ({ pledge }) => {
    const statusMap = {
        pending: { label: '未着手', color: 'text-gray-600 bg-gray-100' },
        in_progress: { label: '進行中', color: 'text-blue-600 bg-blue-100' },
        completed: { label: '達成済み', color: 'text-green-600 bg-green-100' },
        cancelled: { label: '中止', color: 'text-red-600 bg-red-100' },
    };
    const currentStatus = statusMap[pledge.status] || statusMap.pending;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-gray-900">{pledge.title}</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.color}`}>
                    {currentStatus.label}
                </span>
            </div>
            <p className="text-gray-700 mb-4">{pledge.description}</p>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                    <span className="font-semibold text-green-600">{pledge.supportCount}</span> 賛成 / 
                    <span className="font-semibold text-red-600"> {pledge.opposeCount}</span> 反対
                </div>
                {/* TODO: 投票ボタンや詳細リンクをここに追加 */}
                <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                    詳細を見る &rarr;
                </span>
            </div>
        </div>
    );
};


// 活動記録リスト
const ActivityLogList: React.FC<{ activityLogs: ActivityLog[] }> = ({ activityLogs }) => {
    if (activityLogs.length === 0) {
        return (
            <div className="p-10 text-center bg-gray-100 rounded-lg border border-gray-200">
                <Zap className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">現在、登録されている活動記録はありません。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {activityLogs.map(log => (
                <ActivityLogCard key={log.id} log={log} />
            ))}
        </div>
    );
};

// 活動記録カード
const ActivityLogCard: React.FC<{ log: ActivityLog }> = ({ log }) => {
    const formattedDate = new Date(log.createdAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-gray-900">{log.title}</h4>
                <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{log.content.substring(0, 200)}...</p>
            {/* TODO: コメント機能や詳細へのリンクをここに追加 */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                すべて読む & コメントする &rarr;
            </div>
        </div>
    );
};