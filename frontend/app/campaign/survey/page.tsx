'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import { app } from '../../../lib/firebase';
import { PREFECTURES, CITIES_BY_PREF } from '../../../lib/japanLocation';

export default function SurveyPage() {
  const router = useRouter();
  const { isLoggedIn, user, ready } = useAuth();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // フォームデータ
  const [formData, setFormData] = useState({
    ageGroup: '',
    gender: '',
    prefecture: '',
    city: '',
    hasChildren: '',
    childrenCount: '',
    familyStructure: '',
    occupation: '',
    employmentType: '',
    income: '',
    residenceYears: '',
    votingFrequency: '',
    politicalSatisfaction: '',
    socialIssues: [] as string[],
    wantsToExpressOpinion: '',
    wantsToSupportPolitician: '',
    specificRequest: '',
    taxBurden: '',
    taxReductionPriority: '',
    politicalWasteRequest: '',
    taxThoughts: '',
    foreignWorkersOpinion: '',
    foreignWorkersConcern: '',
    foreignWorkersPolicy: '',
    knowsLocalPolitician: '',
    preferredContactMethod: '',
    votingFactors: [] as string[],
    localIssues: '',
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (!ready) return;

    async function checkEmailVerified() {
      if (!isLoggedIn) {
        setEmailVerified(false);
        setLoading(false);
        return;
      }

      try {
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        if (currentUser) {
          // トークンを再取得して最新の認証状態を確認
          await currentUser.reload();
          setEmailVerified(currentUser.emailVerified);
        } else {
          setEmailVerified(false);
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
        setEmailVerified(false);
      } finally {
        setLoading(false);
      }
    }

    checkEmailVerified();
  }, [isLoggedIn, ready]);

  useEffect(() => {
    if (formData.prefecture) {
      const cities = CITIES_BY_PREF[formData.prefecture] || [];
      setAvailableCities(cities);
      if (!cities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.prefecture]);

  const handleSocialIssuesChange = (value: string) => {
    setFormData(prev => {
      const current = prev.socialIssues;
      if (current.includes(value)) {
        return { ...prev, socialIssues: current.filter(v => v !== value) };
      } else if (current.length < 3) {
        return { ...prev, socialIssues: [...current, value] };
      }
      return prev;
    });
  };

  const handleVotingFactorsChange = (value: string) => {
    setFormData(prev => {
      const current = prev.votingFactors;
      if (current.includes(value)) {
        return { ...prev, votingFactors: current.filter(v => v !== value) };
      } else if (current.length < 3) {
        return { ...prev, votingFactors: [...current, value] };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('ユーザーがログインしていません');
      }

      const idToken = await currentUser.getIdToken();
      
      const response = await fetch('/api/campaign/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ...formData,
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'アンケートの送信に失敗しました');
      }

      router.push('/campaign/thanks');
    } catch (error: any) {
      console.error('Survey submission error:', error);
      alert(error.message || 'アンケートの送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001122] to-[#003366] flex items-center justify-center">
        <div className="text-white text-lg">読み込み中...</div>
      </div>
    );
  }

  // 未ログインの場合
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001122] to-[#003366] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">アンケートにご回答いただくには</h1>
            <p className="text-gray-700 mb-8">
              アンケートに回答するにはログインが必要です。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-[#003366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#004488] transition-colors"
              >
                ログインページへ
              </Link>
              <Link
                href="/campaign"
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                新規会員登録（LP）へ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メール認証未完了の場合
  if (!emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001122] to-[#003366] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-yellow-900 mb-4">メール認証が必要です</h1>
            <p className="text-yellow-800 mb-4">
              メール認証が完了していません。届いたメールのリンクをクリックして認証を完了させてください。
            </p>
            <Link
              href="/verify"
              className="inline-block bg-[#003366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#004488] transition-colors"
            >
              認証ページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // アンケートフォーム
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001122] to-[#003366] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">アンケート</h1>
          <p className="text-gray-600 mb-6">ご回答いただいた内容は、今後のサービス改善に活用させていただきます。</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 年齢層 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年齢層 *</label>
              <select
                required
                value={formData.ageGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="18-19">18歳〜19歳</option>
                <option value="20-24">20歳〜24歳</option>
                <option value="25-29">25歳〜29歳</option>
                <option value="30-34">30歳〜34歳</option>
                <option value="35-39">35歳〜39歳</option>
                <option value="40-44">40歳〜44歳</option>
                <option value="45-49">45歳〜49歳</option>
                <option value="50-59">50歳〜59歳</option>
                <option value="60-69">60歳〜69歳</option>
                <option value="70-79">70歳〜79歳</option>
                <option value="80-89">80歳〜89歳</option>
              </select>
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性別 *</label>
              <div className="space-y-2">
                {['男性', '女性', '回答しない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      required
                      checked={formData.gender === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">お住まいの都道府県 *</label>
              <select
                required
                value={formData.prefecture}
                onChange={(e) => setFormData(prev => ({ ...prev, prefecture: e.target.value, city: '' }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref.code} value={pref.name}>{pref.name}</option>
                ))}
              </select>
            </div>

            {/* 市区町村 */}
            {availableCities.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">お住まいの市区町村 *</label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {/* お子様の有無 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">お子様の有無 *</label>
              <div className="space-y-2">
                {['なし（独身・未婚含む）', 'あり（未就学児）', 'あり（小学生以上）', 'あり（18歳以上）', 'その他'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="hasChildren"
                      value={option}
                      required
                      checked={formData.hasChildren === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasChildren: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* お子様の人数 */}
            {formData.hasChildren && formData.hasChildren !== 'なし（独身・未婚含む）' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">お子様の人数 *</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <label key={num} className="flex items-center justify-center border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="childrenCount"
                        value={num.toString()}
                        required
                        checked={formData.childrenCount === num.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{num}人</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 家族構成 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">家族構成 *</label>
              <div className="space-y-2">
                {['単身（一人暮らし）', '夫婦のみ', '夫婦と子供', 'ひとり親と子供', '親子供との同居（３世代など）', 'その他'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="familyStructure"
                      value={option}
                      required
                      checked={formData.familyStructure === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, familyStructure: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 現在のご職業 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">現在のご職業 *</label>
              <div className="space-y-2">
                {['会社員・公務員', '自営業・フリーランス', '会社経営・役員', 'パート・アルバイト', '専業主婦・主夫', '学生', '現在無職・その他'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="occupation"
                      value={option}
                      required
                      checked={formData.occupation === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 雇用形態 */}
            {formData.occupation && ['会社員・公務員', 'パート・アルバイト'].includes(formData.occupation) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">雇用形態 *</label>
                <div className="space-y-2">
                  {['正社員', '非正規雇用（契約・派遣）', '該当なし（自営業・主婦・学生など）', '現在無職・その他'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="employmentType"
                        value={option}
                        required
                        checked={formData.employmentType === option}
                        onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 現在の年収 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">現在の年収 *</label>
              <div className="space-y-2">
                {['103万円以下', '103万円超 〜 240万円以下', '240万円超 〜 400万円以下', '400万円超 〜 600万円以下', '600万円超 〜 800万円以下', '800万円超 〜 1,000万円以下', '1,000万円超 〜 1,500万円以下', '1,500万円超'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="income"
                      value={option}
                      required
                      checked={formData.income === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, income: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 現在の居住年数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">現在の居住年数 *</label>
              <div className="space-y-2">
                {['1年未満', '1年以上〜5年未満', '5年以上〜10年未満', '10年以上'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="residenceYears"
                      value={option}
                      required
                      checked={formData.residenceYears === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, residenceYears: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 選挙の投票頻度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">選挙の投票頻度 *</label>
              <div className="space-y-2">
                {['毎回必ず行く', '行くことが多い', 'あまり行かない', '一度も行ったことがない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="votingFrequency"
                      value={option}
                      required
                      checked={formData.votingFrequency === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, votingFrequency: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 今の日本の政治について、あなたの満足度を教えてください */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">今の日本の政治について、あなたの満足度を教えてください *</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="politicalSatisfaction"
                      value={num.toString()}
                      required
                      checked={formData.politicalSatisfaction === num.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, politicalSatisfaction: e.target.value }))}
                      className="mb-2"
                    />
                    <span className="text-gray-700">{num}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>非常に不満</span>
                <span>非常に満足</span>
              </div>
            </div>

            {/* あなたが今、最も解決してほしい社会課題は何ですか？（3つまで） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">あなたが今、最も解決してほしい社会課題は何ですか？（3つまで） *</label>
              <div className="space-y-2">
                {['減税・所得の向上', '子育て支援・教育無償化', '物価高騰対策', '年金・老後不安の解消', '地域の交通・インフラ整備', 'デジタル化・行政の効率化', '防衛・外交', '環境・エネルギー問題', '外国人移民問題', 'その他（自由記述）'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.socialIssues.includes(option)}
                      onChange={() => handleSocialIssuesChange(option)}
                      disabled={!formData.socialIssues.includes(option) && formData.socialIssues.length >= 3}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {formData.socialIssues.length >= 3 && (
                <p className="text-sm text-gray-500 mt-2">3つまで選択できます</p>
              )}
            </div>

            {/* もし、スマホで匿名かつ手軽に「自分の意見が政治家に届く」なら、もっと自分の意見を発信したいと思いますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">もし、スマホで匿名かつ手軽に「自分の意見が政治家に届く」なら、もっと自分の意見を発信したいと思いますか？ *</label>
              <div className="space-y-2">
                {['強くそう思う', 'まあまあそう思う', 'あまり思わない', '全く思わない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="wantsToExpressOpinion"
                      value={option}
                      required
                      checked={formData.wantsToExpressOpinion === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, wantsToExpressOpinion: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 議員からあなたの意見に対して「直接回答（返信）」が届く仕組みがあれば、その議員を応援したいと思いますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">議員からあなたの意見に対して「直接回答（返信）」が届く仕組みがあれば、その議員を応援したいと思いますか？ *</label>
              <div className="space-y-2">
                {['非常に思う', '内容によっては思う', 'あまり思わない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="wantsToSupportPolitician"
                      value={option}
                      required
                      checked={formData.wantsToSupportPolitician === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, wantsToSupportPolitician: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 地元の議員や国会議員に対して「これだけは言いたい！」という具体的な要望を教えてください */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地元の議員や国会議員に対して「これだけは言いたい！」という具体的な要望を教えてください *
                <span className="text-sm text-gray-500 font-normal block mt-1">例：保育園の入所基準を見直してほしい、税金が高い！など</span>
              </label>
              <textarea
                required
                value={formData.specificRequest}
                onChange={(e) => setFormData(prev => ({ ...prev, specificRequest: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                placeholder="ご意見をお聞かせください"
              />
            </div>

            {/* 現在の「税金・社会保険料」の負担についてどう感じますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">現在の「税金・社会保険料」の負担についてどう感じますか？ *</label>
              <div className="space-y-2">
                {['非常に重すぎる（生活が苦しい）', 'やや重い', '妥当である', '社会保障が充実するならもっと払っても良い'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="taxBurden"
                      value={option}
                      required
                      checked={formData.taxBurden === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxBurden: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* もし「減税」が行われるとしたら、何を最優先すべきだと思いますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">もし「減税」が行われるとしたら、何を最優先すべきだと思いますか？ *</label>
              <div className="space-y-2">
                {['消費税の減税', '所得税の減税（手取りアップ）', '社会保険料の引き下げ', 'ガソリン税・電気代等の補助'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="taxReductionPriority"
                      value={option}
                      required
                      checked={formData.taxReductionPriority === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxReductionPriority: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 「増税」が進む一方で、政治家の裏金問題や公金の無駄遣いについて、今の政治に何を求めますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">「増税」が進む一方で、政治家の裏金問題や公金の無駄遣いについて、今の政治に何を求めますか？ *</label>
              <textarea
                required
                value={formData.politicalWasteRequest}
                onChange={(e) => setFormData(prev => ({ ...prev, politicalWasteRequest: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                placeholder="ご意見をお聞かせください"
              />
            </div>

            {/* 今の税金に対して思っていることを記述してください。 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">今の税金に対して思っていることを記述してください。 *</label>
              <textarea
                required
                value={formData.taxThoughts}
                onChange={(e) => setFormData(prev => ({ ...prev, taxThoughts: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                placeholder="ご意見をお聞かせください"
              />
            </div>

            {/* 外国人材の受け入れ拡大について、あなたの意見に近いものはどれですか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">外国人材の受け入れ拡大について、あなたの意見に近いものはどれですか？ *</label>
              <div className="space-y-2">
                {['労働力不足解消のため、積極的に進めるべき', '厳格な審査・管理を前提に、一定数は受け入れるべき', '治安や文化摩擦が不安なので、慎重（または反対）である', 'わからない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="foreignWorkersOpinion"
                      value={option}
                      required
                      checked={formData.foreignWorkersOpinion === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, foreignWorkersOpinion: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 外国人との共生において、あなたが最も「不安」や「課題」に感じていることは何ですか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">外国人との共生において、あなたが最も「不安」や「課題」に感じていることは何ですか？ *</label>
              <div className="space-y-2">
                {['治安の悪化', '文化や生活習慣（ゴミ出し・騒音等）の摩擦', '日本人の雇用や賃金への影響', '社会保障制度（医療保険等）のタダ乗り懸念', '特に不安はない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="foreignWorkersConcern"
                      value={option}
                      required
                      checked={formData.foreignWorkersConcern === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, foreignWorkersConcern: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 不法滞在やルールの守れない外国人に対する、政府・自治体の対応はどうあるべきだと思いますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">不法滞在やルールの守れない外国人に対する、政府・自治体の対応はどうあるべきだと思いますか？ *</label>
              <textarea
                required
                value={formData.foreignWorkersPolicy}
                onChange={(e) => setFormData(prev => ({ ...prev, foreignWorkersPolicy: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                placeholder="ご意見をお聞かせください"
              />
            </div>

            {/* あなたは、地元の議員（市議・区議など）が普段どんな活動をしているか知っていますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">あなたは、地元の議員（市議・区議など）が普段どんな活動をしているか知っていますか？ *</label>
              <div className="space-y-2">
                {['よく知っている（SNSやチラシを定期的に見ている）', 'なんとなく知っている（選挙の時だけ見かける）', 'ほとんど知らない', '全く知らない'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="knowsLocalPolitician"
                      value={option}
                      required
                      checked={formData.knowsLocalPolitician === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, knowsLocalPolitician: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* もし、あなたが政治家に対して「自分の意見を伝えたい」と思った場合、どの方法が最も心理的ハードルが低い（使いやすい）ですか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">もし、あなたが政治家に対して「自分の意見を伝えたい」と思った場合、どの方法が最も心理的ハードルが低い（使いやすい）ですか？ *</label>
              <div className="space-y-2">
                {['直接会って話す（対面の相談会など）', '役所に電話やメールをする', 'X（旧Twitter）やInstagramにコメントする', '匿名で投稿でき、他の住民の賛同も可視化される専用のSNSを利用したい。', '伝えること自体を諦める'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value={option}
                      required
                      checked={formData.preferredContactMethod === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 選挙において、あなたが「この人に投票しよう」と決める際に、ポジティブに影響する要素はどれですか？（3つまで） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">選挙において、あなたが「この人に投票しよう」と決める際に、ポジティブに影響する要素はどれですか？（3つまで） *</label>
              <div className="space-y-2">
                {['政策の具体性', '政党のブランド', '定期的に街頭演説をしている', 'ネット上で住民の声に対して丁寧に回答・リアクションをしている', '地域（町内会やイベント）に顔を出している', '知名度・人柄'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.votingFactors.includes(option)}
                      onChange={() => handleVotingFactorsChange(option)}
                      disabled={!formData.votingFactors.includes(option) && formData.votingFactors.length >= 3}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {formData.votingFactors.length >= 3 && (
                <p className="text-sm text-gray-500 mt-2">3つまで選択できます</p>
              )}
            </div>

            {/* 行政の広報紙には載っていないけれど、あなたの生活圏内で「ここを少し直せばもっと良くなるのに」と感じる小さな問題はありますか？ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                行政の広報紙には載っていないけれど、あなたの生活圏内で「ここを少し直せばもっと良くなるのに」と感じる小さな問題はありますか？ *
                <span className="text-sm text-gray-500 font-normal block mt-1">例：特定の場所のゴミ、街灯、公園のルール、歩道の段差など</span>
              </label>
              <textarea
                required
                value={formData.localIssues}
                onChange={(e) => setFormData(prev => ({ ...prev, localIssues: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                placeholder="ご意見をお聞かせください"
              />
            </div>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#003366] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#004488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '送信中...' : '送信する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

