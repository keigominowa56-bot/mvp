'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, MapPin, Building, ExternalLink } from 'lucide-react';

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
  supportCount: number;
  opposeCount: number;
  voteCount: number;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  title: string;
  content: string;
  source: 'manual' | 'twitter' | 'rss' | 'official';
  sourceUrl?: string;
  createdAt: string;
}

interface ActivityFund {
  id: string;
  fiscalYear: number;
  category: string;
  amount: number;
  description?: string;
  expenseDate?: string;
  recipient?: string;
  purpose?: string;
}

interface MembersGridProps {
  members: Member[];
}

export default function MembersGrid({ members }: MembersGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '進行中';
      case 'pending':
        return '未着手';
      case 'cancelled':
        return '中止';
      default:
        return status;
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            登録議員一覧
          </h2>
          <p className="text-lg text-gray-600">
            各議員のプロフィール、公約、活動履歴をご確認ください
          </p>
        </motion.div>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">登録されている議員はいません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-gray-600">{member.position || '議員'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {member.affiliation}
                    </div>
                    {member.district && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {member.district}
                      </div>
                    )}
                    {member.party && (
                      <div className="text-sm text-gray-600">
                        所属政党: {member.party}
                      </div>
                    )}
                  </div>

                  {member.biography && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {member.biography}
                    </p>
                  )}

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">公約状況</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.pledges.slice(0, 3).map((pledge) => (
                        <span
                          key={pledge.id}
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pledge.status)}`}
                        >
                          {getStatusText(pledge.status)}
                        </span>
                      ))}
                      {member.pledges.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          +{member.pledges.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>公約数: {member.pledges.length}</span>
                    <span>活動ログ: {member.activityLogs.length}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/members/${member.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      詳細を見る
                    </Link>
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/members"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            すべての議員を見る
            <ExternalLink className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
