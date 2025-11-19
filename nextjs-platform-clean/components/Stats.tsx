'use client';

import { motion } from 'framer-motion';
import { Users, FileText, Activity, DollarSign } from 'lucide-react';

interface StatsProps {
  stats: {
    members: { totalMembers: number; activeMembers: number };
    pledges: { totalPledges: number; completedPledges: number; inProgressPledges: number };
    users: { totalUsers: number; activeUsers: number; adminUsers: number };
    activityLogs: { totalLogs: number; publicLogs: number };
    activityFunds: { totalFunds: number; totalAmount: number; averageAmount: number };
  } | null;
}

export default function Stats({ stats }: StatsProps) {
  if (!stats) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const statItems = [
    {
      icon: Users,
      label: '登録議員数',
      value: stats.members.activeMembers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: FileText,
      label: '公約数',
      value: stats.pledges.totalPledges,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Activity,
      label: '活動ログ数',
      value: stats.activityLogs.publicLogs,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: DollarSign,
      label: '政務活動費総額',
      value: `¥${(stats.activityFunds.totalAmount / 1000000).toFixed(1)}M`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            プラットフォーム統計
          </h2>
          <p className="text-lg text-gray-600">
            現在のプラットフォームの利用状況をご確認ください
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                完了済み公約
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.pledges.completedPledges}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                進行中: {stats.pledges.inProgressPledges}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                登録ユーザー数
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.users.activeUsers}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                管理者: {stats.users.adminUsers}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                平均政務活動費
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                ¥{Math.round(stats.activityFunds.averageAmount).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                記録数: {stats.activityFunds.totalFunds}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
