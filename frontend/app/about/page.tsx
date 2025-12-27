'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Eye, 
  Heart, 
  Target, 
  CheckCircle, 
  BarChart3, 
  Globe,
  MessageSquare,
  TrendingUp,
  Award,
  Lightbulb
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: '議員情報の透明性',
      description: '地方議会議員の基本情報、経歴、所属政党などを公開し、市民が議員を理解しやすくします。'
    },
    {
      icon: Target,
      title: '公約の追跡',
      description: '議員が掲げた公約の進捗状況を可視化し、実現度を市民が確認できるようにします。'
    },
    {
      icon: BarChart3,
      title: '政務活動費の可視化',
      description: '議員の政務活動費の使途をカテゴリ別に集計し、円グラフや棒グラフで分かりやすく表示します。'
    },
    {
      icon: MessageSquare,
      title: '市民参加の促進',
      description: '公約や活動に対する賛否投票機能により、市民の声を政治に反映させます。'
    },
    {
      icon: Globe,
      title: '外部情報の統合',
      description: 'Twitter、RSS、公式サイトなど複数のソースから議員の活動情報を自動収集します。'
    },
    {
      icon: TrendingUp,
      title: 'データ駆動型の政治',
      description: '客観的なデータに基づいて政治の透明性を向上させ、より良い民主主義を実現します。'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: '透明性',
      description: '政治の透明性を最優先に考え、すべての情報を市民に開示します。'
    },
    {
      icon: Heart,
      title: '市民参加',
      description: '市民が政治に参加し、声を届けられる仕組みを提供します。'
    },
    {
      icon: Eye,
      title: '監視機能',
      description: '議員の活動を市民が監視し、責任ある政治を促進します。'
    },
    {
      icon: Award,
      title: '信頼性',
      description: '正確で信頼できる情報を提供し、データの整合性を保ちます。'
    }
  ];

  const stats = [
    { label: '登録議員数', value: '3名', description: '現在登録されている議員' },
    { label: '公開公約数', value: '4件', description: '追跡可能な公約' },
    { label: '活動ログ数', value: '3件', description: '記録された活動' },
    { label: '政務活動費', value: '¥2.8M', description: '可視化された支出' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                このサイトについて
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                市民参加型 透明性データプラットフォームは、政治の透明性向上と市民参加の促進を目指す革新的なプラットフォームです。
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">政治の透明性</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">市民参加</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">データ駆動</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">私たちの使命</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                地方議会議員の活動情報、公約、および政務活動費の使途を市民が公平に確認・評価できる環境を提供し、
                政治と市民のエンゲージメントを向上させることを目指しています。
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">主要機能</h2>
              <p className="text-lg text-gray-600">
                プラットフォームの核心となる機能をご紹介します
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 ml-4">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">私たちの価値観</h2>
              <p className="text-lg text-gray-600">
                プラットフォームの根底にある価値観と理念
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">技術的特徴</h2>
              <p className="text-lg text-gray-600">
                最新の技術を活用した堅牢で拡張性の高いプラットフォーム
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'NestJS', description: '堅牢なバックエンドAPI' },
                { name: 'Next.js', description: '高速なフロントエンド' },
                { name: 'TypeORM', description: '型安全なデータベース' },
                { name: 'Firebase', description: 'セキュアな認証システム' },
                { name: 'Recharts', description: '美しいデータ可視化' },
                { name: 'Tailwind CSS', description: 'モダンなUIデザイン' },
                { name: 'Framer Motion', description: '滑らかなアニメーション' },
                { name: 'Swagger', description: '包括的なAPI文書' }
              ].map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-4">お問い合わせ</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                ご質問、ご提案、または技術的なお問い合わせがございましたら、お気軽にご連絡ください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@transparency-platform.jp"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  メールでお問い合わせ
                </a>
                <a
                  href="https://github.com/transparency-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  GitHub で確認
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
