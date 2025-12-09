'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Activity, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  affiliation: string;
  biography?: string;
  position?: string;
  district?: string;
  party?: string;
  website?: string;
  twitterHandle?: string;
  pledges: Pledge[];
  activityLogs: ActivityLog[];
  activityFunds: ActivityFund[];
}

interface Pledge {
  id: string;
  title: string;
  description: string;
  category?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  voteCount: number;
  supportCount: number;
  opposeCount: number;
}

interface ActivityLog {
  id: string;
  title: string;
  content: string;
  source: 'manual' | 'twitter' | 'rss' | 'official';
  createdAt: string;
}

interface ActivityFund {
  id: string;
  fiscalYear: number;
  category: string;
  amount: number;
  description?: string;
  expenseDate?: string;
}

interface DashboardStats {
  members: { totalMembers: number; activeMembers: number };
  pledges: { totalPledges: number; completedPledges: number; inProgressPledges: number };
  users: { totalUsers: number; activeUsers: number; adminUsers: number };
  activityLogs: { totalLogs: number; publicLogs: number };
  activityFunds: { totalAmount: number; averageAmount: number };
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'pledges' | 'activity-funds'>('dashboard');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [loading, user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, membersRes] = await Promise.all([
        api.get('/admin/dashboard').catch(() => ({ data: null })),
        api.get('/members').catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data);
      setMembers(membersRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('データの取得に失敗しました');
      setStats(null);
      setMembers([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCollectData = async () => {
    try {
      await api.post('/external-feeds/collect-all');
      toast.success('外部データの収集を開始しました');
    } catch (error) {
      console.error('Error collecting data:', error);
      toast.error('データ収集に失敗しました');
    }
  };

  const handleImportActivityFunds = async (memberId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post(`/admin/import/activity-funds/${memberId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('政務活動費データをインポートしました');
      fetchDashboardData();
    } catch (error) {
      console.error('Error importing activity funds:', error);
      toast.error('インポートに失敗しました');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('この議員を削除しますか？')) return;
    
    try {
      await api.delete(`/members/${memberId}`);
      toast.success('議員を削除しました');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('削除に失敗しました');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-4">このページにアクセスするにはログインが必要です。</p>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  // デモ用: 管理者権限がない場合でもアクセスを許可（開発環境のみ）
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (user.role !== 'admin' && !isDevelopment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス拒否</h1>
          <p className="text-gray-600">このページにアクセスするには管理者権限が必要です。</p>
          <p className="text-sm text-gray-500 mt-2">現在のユーザー: {user.displayName || user.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理画面</h1>
          <p className="text-gray-600">プラットフォームの管理とデータの更新を行います</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'ダッシュボード', icon: BarChart3 },
              { id: 'members', label: '議員管理', icon: Users },
              { id: 'pledges', label: '公約管理', icon: FileText },
              { id: 'activity-funds', label: '政務活動費', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">登録議員</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.members.activeMembers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">公約数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pledges.totalPledges}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">活動ログ</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activityLogs.totalLogs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">政務活動費総額</p>
                    <p className="text-2xl font-bold text-gray-900">¥{(stats.activityFunds.totalAmount / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">管理操作</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCollectData}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  外部データ収集
                </button>
                
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  データ更新
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">議員管理</h2>
              <button
                onClick={() => setShowMemberForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                議員追加
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        議員名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        所属
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        公約数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        活動ログ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.affiliation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.pledges.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.activityLogs.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingMember(member)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Funds Tab */}
        {activeTab === 'activity-funds' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">政務活動費管理</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">CSVインポート</h3>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.affiliation}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImportActivityFunds(member.id, file);
                          }
                        }}
                        className="hidden"
                        id={`file-${member.id}`}
                      />
                      <label
                        htmlFor={`file-${member.id}`}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        インポート
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
