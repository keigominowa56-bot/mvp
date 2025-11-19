'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function HelpPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['getting-started']));

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const faqData = [
    {
      id: 'getting-started',
      title: 'はじめに',
      icon: HelpCircle,
      items: [
        {
          question: 'このプラットフォームとは何ですか？',
          answer: '市民参加型 透明性データプラットフォームは、地方議会議員の活動情報、公約、および政務活動費の使途を市民が公平に確認・評価できるプラットフォームです。政治の透明性向上と市民参加の促進を目指しています。'
        },
        {
          question: 'どのような機能がありますか？',
          answer: '議員情報の閲覧、公約の追跡、政務活動費の可視化、投票機能、活動ログの確認、外部データの自動収集などの機能を提供しています。'
        },
        {
          question: '利用料金はかかりますか？',
          answer: 'すべての機能は無料でご利用いただけます。アカウント作成も無料です。'
        }
      ]
    },
    {
      id: 'account',
      title: 'アカウント・ログイン',
      icon: Users,
      items: [
        {
          question: 'アカウントの作成方法を教えてください',
          answer: 'トップページの「新規登録」ボタンをクリックし、必要事項を入力してアカウントを作成してください。メールアドレスとパスワードが必要です。'
        },
        {
          question: 'ログインできない場合はどうすればよいですか？',
          answer: 'メールアドレスとパスワードが正しいか確認してください。パスワードを忘れた場合は、ログインページの「パスワードを忘れた場合」リンクから再設定できます。'
        },
        {
          question: 'Googleアカウントでログインできますか？',
          answer: 'はい、Googleアカウントでのログインも可能です。ログインページの「Googleでログイン」ボタンを使用してください。'
        }
      ]
    },
    {
      id: 'members',
      title: '議員情報',
      icon: Users,
      items: [
        {
          question: '議員の情報はどこで確認できますか？',
          answer: '「議員一覧」ページで全議員の一覧を確認でき、各議員の詳細ページで詳細情報、公約、活動ログ、政務活動費などを確認できます。'
        },
        {
          question: '議員の検索はできますか？',
          answer: '議員一覧ページで名前、所属、区、政党で検索できます。また、フィルター機能で条件を絞り込むことも可能です。'
        },
        {
          question: '議員の情報はどのくらいの頻度で更新されますか？',
          answer: '議員の基本情報は手動で更新されますが、活動ログは外部データ（Twitter、RSS、公式サイト）から自動収集されます。'
        }
      ]
    },
    {
      id: 'pledges',
      title: '公約・投票',
      icon: MessageSquare,
      items: [
        {
          question: '公約に投票するにはどうすればよいですか？',
          answer: 'ログイン後、議員の詳細ページで公約を確認し、「賛成」または「反対」ボタンをクリックして投票できます。1つの公約につき1回まで投票可能です。'
        },
        {
          question: '投票を変更・取り消すことはできますか？',
          answer: 'はい、投票後も「賛成」「反対」ボタンをクリックすることで投票を変更できます。投票を取り消すには、現在の投票と同じボタンを再度クリックしてください。'
        },
        {
          question: '公約の進捗状況はどのように更新されますか？',
          answer: '公約の進捗状況は議員または管理者が手動で更新します。「未着手」「進行中」「完了」「中止」の4つのステータスがあります。'
        }
      ]
    },
    {
      id: 'activity-funds',
      title: '政務活動費',
      icon: BarChart3,
      items: [
        {
          question: '政務活動費の情報はどこで確認できますか？',
          answer: '議員の詳細ページで政務活動費の情報を確認できます。カテゴリ別の円グラフと棒グラフで可視化されています。'
        },
        {
          question: '政務活動費のデータはどのように収集されますか？',
          answer: '政務活動費のデータは管理者がCSVファイルでインポートします。各議員の支出データをカテゴリ別に分類して表示します。'
        },
        {
          question: '政務活動費のデータはどのくらいの頻度で更新されますか？',
          answer: '政務活動費のデータは管理者が定期的に更新します。更新頻度は各自治体の公開スケジュールに依存します。'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'プライバシー・セキュリティ',
      icon: Shield,
      items: [
        {
          question: '個人情報はどのように保護されますか？',
          answer: 'Firebase Authenticationを使用した安全な認証システムを採用し、個人情報は適切に暗号化されて保護されます。'
        },
        {
          question: '投票情報は他のユーザーに公開されますか？',
          answer: '個別の投票内容は公開されません。集計結果（賛成数、反対数、総投票数）のみが表示されます。'
        },
        {
          question: 'データの削除は可能ですか？',
          answer: 'アカウント削除時に個人データも削除されます。詳細についてはプライバシーポリシーをご確認ください。'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ヘルプセンター</h1>
          <p className="text-lg text-gray-600">
            よくある質問と回答をまとめました。お困りの際はこちらをご確認ください。
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="質問を検索..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {faqData.map((section, sectionIndex) => {
            const Icon = section.icon;
            const isOpen = openSections.has(section.id);
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-blue-600 mr-3" />
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-4">
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                          <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-blue-50 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">まだ解決しませんか？</h2>
          <p className="text-gray-600 mb-4">
            上記のFAQで解決しない場合は、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              お問い合わせ
            </a>
            <a
              href="mailto:support@transparency-platform.jp"
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              メールでサポート
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
