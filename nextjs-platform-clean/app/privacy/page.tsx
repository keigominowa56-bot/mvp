'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: '情報の収集',
      content: [
        '当プラットフォームでは、以下の情報を収集します：',
        '• アカウント情報（メールアドレス、表示名、居住区）',
        '• 投票情報（公約に対する賛成・反対の投票）',
        '• アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）',
        '• 議員の公開情報（プロフィール、公約、活動ログ、政務活動費）'
      ]
    },
    {
      icon: Database,
      title: '情報の利用目的',
      content: [
        '収集した情報は以下の目的で利用します：',
        '• プラットフォームの提供・運営',
        '• ユーザー認証・アカウント管理',
        '• 投票機能の提供・集計',
        '• サービス改善・新機能開発',
        '• 不正利用の防止・セキュリティ確保',
        '• 法令に基づく対応'
      ]
    },
    {
      icon: Lock,
      title: '情報の保護',
      content: [
        '個人情報の保護のため、以下の措置を講じています：',
        '• Firebase Authenticationによる安全な認証',
        '• HTTPS通信によるデータの暗号化',
        '• アクセス制御による不正アクセスの防止',
        '• 定期的なセキュリティ監査',
        '• データベースの暗号化',
        '• 従業員への情報セキュリティ教育'
      ]
    },
    {
      icon: UserCheck,
      title: '第三者への提供',
      content: [
        '以下の場合を除き、個人情報を第三者に提供することはありません：',
        '• ユーザーの同意がある場合',
        '• 法令に基づく場合',
        '• 人の生命、身体または財産の保護のために必要な場合',
        '• 公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合',
        '• 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合'
      ]
    },
    {
      icon: Mail,
      title: 'お問い合わせ',
      content: [
        '個人情報の取扱いに関するお問い合わせは、以下までご連絡ください：',
        'メール: privacy@transparency-platform.jp',
        '受付時間: 平日 9:00-18:00',
        '回答までに数日を要する場合がございます。'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
          <p className="text-lg text-gray-600">
            最終更新日: 2024年1月1日
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">はじめに</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            市民参加型 透明性データプラットフォーム（以下「当プラットフォーム」）は、
            ユーザーの個人情報の保護を重要な責務と考え、以下のプライバシーポリシーに従って
            個人情報を適切に取り扱います。
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <div className="flex items-center mb-6">
                  <Icon className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <p key={itemIndex} className="text-gray-700 leading-relaxed">
                      {item}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 rounded-lg p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">その他の重要な事項</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookieの使用</h3>
              <p className="text-gray-700">
                当プラットフォームでは、サービス向上のためCookieを使用しています。
                Cookieの使用を希望しない場合は、ブラウザの設定で無効にできます。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">プライバシーポリシーの変更</h3>
              <p className="text-gray-700">
                当プラットフォームは、必要に応じて本プライバシーポリシーを変更する場合があります。
                変更があった場合は、当プラットフォーム上でお知らせします。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">適用法令</h3>
              <p className="text-gray-700">
                本プライバシーポリシーは、日本の個人情報保護法およびその他の関連法令に準拠します。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 mb-4">
            本プライバシーポリシーに関するご質問がございましたら、お気軽にお問い合わせください。
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            お問い合わせ
          </a>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
