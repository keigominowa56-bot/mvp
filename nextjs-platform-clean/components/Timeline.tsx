'use client';

import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Twitter, Rss, FileText, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

interface ActivityLog {
  id: string;
  title: string;
  content: string;
  source: 'manual' | 'twitter' | 'rss' | 'official';
  sourceUrl?: string;
  createdAt: string;
  member?: {
    id: string;
    name: string;
    photoUrl?: string;
  };
}

interface TimelineProps {
  activityLogs: ActivityLog[];
}

export default function Timeline({ activityLogs }: TimelineProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'rss':
        return <Rss className="w-4 h-4" />;
      case 'official':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'twitter':
        return 'bg-blue-100 text-blue-600';
      case 'rss':
        return 'bg-orange-100 text-orange-600';
      case 'official':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'twitter':
        return 'Twitter';
      case 'rss':
        return 'RSS';
      case 'official':
        return '公式サイト';
      default:
        return '手動投稿';
    }
  };

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
            最新活動タイムライン
          </h2>
          <p className="text-lg text-gray-600">
            議員の最新の活動情報をリアルタイムで確認できます
          </p>
        </motion.div>

        {activityLogs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">活動ログはありません</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {activityLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {log.member?.photoUrl ? (
                        <img
                          src={log.member.photoUrl}
                          alt={log.member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {log.member?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {log.member ? (
                          <Link href={`/members/${log.member.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                              {log.member.name}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-900">
                            不明な議員
                          </h3>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(log.source)}`}
                        >
                          {getSourceIcon(log.source)}
                          <span className="ml-1">{getSourceText(log.source)}</span>
                        </span>
                      </div>

                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {log.title}
                      </h4>

                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {log.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(log.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </div>

                        {log.sourceUrl && (
                          <a
                            href={log.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            元の投稿を見る
                          </a>
                        )}
                      </div>
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
              className="text-center mt-12"
            >
              <a
                href="/timeline"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                すべての活動を見る
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
