'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Shield, Users, Ban, Gavel } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: '第1条（適用）',
      content: [
        '本利用規約（以下「本規約」）は、市民参加型 透明性データプラットフォーム（以下「当プラットフォーム」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。',
        'ユーザーは、本サービスを利用することにより、本規約に同意したものとみなします。'
      ]
    },
    {
      icon: Users,
      title: '第2条（利用登録）',
      content: [
        '本サービスにおいては、登録希望者が本規約に同意の上、当プラットフォームの定める方法によって利用登録を申請し、当プラットフォームがこれを承認することによって、利用登録が完了するものとします。',
        '当プラットフォームは、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。',
        '• 利用登録の申請に際して虚偽の事項を届け出た場合',
        '• 本規約に違反したことがある者からの申請である場合',
        '• その他、当プラットフォームが利用登録を相当でないと判断した場合'
      ]
    },
    {
      icon: Shield,
      title: '第3条（ユーザーIDおよびパスワードの管理）',
      content: [
        'ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。',
        'ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。',
        '当プラットフォームは、ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。'
      ]
    },
    {
      icon: AlertTriangle,
      title: '第4条（禁止事項）',
      content: [
        'ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。',
        '• 法令または公序良俗に違反する行為',
        '• 犯罪行為に関連する行為',
        '• 本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為',
        '• 当プラットフォーム、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為',
        '• 本サービスによって得られた情報を商業的に利用する行為',
        '• 当プラットフォームのサービスの運営を妨害するおそれのある行為',
        '• 不正アクセスをし、またはこれを試みる行為',
        '• 他のユーザーに関する個人情報等を収集または蓄積する行為',
        '• 不正な目的を持って本サービスを利用する行為',
        '• 本サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為',
        '• 他のユーザーに成りすます行為',
        '• 当プラットフォームが許諾しない本サービス上での宣伝、広告、勧誘、または営業行為',
        '• 面識のない異性との出会いを目的とした行為',
        '• 当プラットフォームのサービスに関連して、反社会的勢力に対して直接または間接的に利益を供与する行為',
        '• その他、当プラットフォームが不適切と判断する行為'
      ]
    },
    {
      icon: Ban,
      title: '第5条（本サービスの提供の停止等）',
      content: [
        '当プラットフォームは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。',
        '• 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合',
        '• 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合',
        '• コンピュータまたは通信回線等が事故により停止した場合',
        '• その他、当プラットフォームが本サービスの提供が困難と判断した場合',
        '当プラットフォームは、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。'
      ]
    },
    {
      icon: Gavel,
      title: '第6条（利用制限および登録抹消）',
      content: [
        '当プラットフォームは、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。',
        '• 本規約のいずれかの条項に違反した場合',
        '• 登録事項に虚偽の事実があることが判明した場合',
        '• 決済手段として当該ユーザーが届け出たクレジットカードが利用停止となった場合',
        '• 料金等の支払債務の不履行があった場合',
        '• 当プラットフォームからの連絡に対し、一定期間返答がない場合',
        '• 本サービスについて、最後の利用から一定期間利用がない場合',
        '• その他、当プラットフォームが本サービスの利用を適当でないと判断した場合',
        '当プラットフォームは、本条に基づき当プラットフォームが行った行為によりユーザーに生じた損害について、一切の責任を負いません。'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">利用規約</h1>
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
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">はじめに</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            この利用規約（以下「本規約」）は、市民参加型 透明性データプラットフォーム（以下「当プラットフォーム」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。
            本サービスをご利用いただく前に、必ず本規約をお読みください。
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

        {/* Additional Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">その他の条項</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">第7条（免責事項）</h3>
              <p className="text-gray-700 leading-relaxed">
                当プラットフォームは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">第8条（サービス内容の変更等）</h3>
              <p className="text-gray-700 leading-relaxed">
                当プラットフォームは、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">第9条（利用規約の変更）</h3>
              <p className="text-gray-700 leading-relaxed">
                当プラットフォームは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">第10条（準拠法・裁判管轄）</h3>
              <p className="text-gray-700 leading-relaxed">
                本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当プラットフォームの本店所在地を管轄する裁判所を専属的合意管轄とします。
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
            本利用規約に関するご質問がございましたら、お気軽にお問い合わせください。
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
