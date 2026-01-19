'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type SurveyResponse = {
  id: string;
  uid: string;
  email: string;
  emailVerified: boolean;
  isAnonymous?: boolean; // 匿名回答フラグ
  ipAddress: string;
  userAgent: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | null;
  prefecture?: string;
  city?: string;
  ageGroup?: string;
  gender?: string;
  hasChildren?: string;
  childrenCount?: string;
  familyStructure?: string;
  occupation?: string;
  employmentType?: string;
  income?: string;
  residenceYears?: string;
  votingFrequency?: string;
  politicalSatisfaction?: string;
  socialIssues?: string[];
  wantsToExpressOpinion?: string;
  wantsToSupportPolitician?: string;
  specificRequest?: string;
  taxBurden?: string;
  taxReductionPriority?: string;
  politicalWasteRequest?: string;
  taxThoughts?: string;
  foreignWorkersOpinion?: string;
  foreignWorkersConcern?: string;
  foreignWorkersPolicy?: string;
  knowsLocalPolitician?: string;
  preferredContactMethod?: string;
  votingFactors?: string[];
  localIssues?: string;
};

export default function SurveyResponsesPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'responses'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SurveyResponse[];
        setResponses(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching responses:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // IPアドレスの重複を検出
  const ipCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.ipAddress && r.ipAddress !== 'unknown') {
        counts[r.ipAddress] = (counts[r.ipAddress] || 0) + 1;
      }
    });
    return counts;
  }, [responses]);

  const duplicateIPs = useMemo(() => {
    return new Set(Object.keys(ipCounts).filter((ip) => ipCounts[ip] > 1));
  }, [ipCounts]);

  // 統計サマリー
  const stats = useMemo(() => {
    const total = responses.length;
    const verified = responses.filter((r) => r.emailVerified).length;
    const uniqueIPs = new Set(
      responses
        .map((r) => r.ipAddress)
        .filter((ip) => ip && ip !== 'unknown')
    ).size;

    return { total, verified, uniqueIPs };
  }, [responses]);

  // フィルタリング
  const filteredResponses = useMemo(() => {
    let filtered = responses;

    if (showVerifiedOnly) {
      filtered = filtered.filter((r) => r.emailVerified);
    }

    if (showDuplicatesOnly) {
      filtered = filtered.filter((r) => duplicateIPs.has(r.ipAddress));
    }

    return filtered;
  }, [responses, showVerifiedOnly, showDuplicatesOnly, duplicateIPs]);

  const formatDate = (timestamp: Timestamp | { seconds: number; nanoseconds: number } | null) => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Timestamp 
      ? timestamp.toDate() 
      : new Date(timestamp.seconds * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDuplicateIP = (ipAddress: string) => {
    return duplicateIPs.has(ipAddress);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">アンケート回答管理</h1>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総回答数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">メール認証済み数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verified}</p>
              <p className="text-sm text-gray-500 mt-1">
                ({stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%)
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ユニークIP数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uniqueIPs}</p>
              <p className="text-sm text-gray-500 mt-1">
                (重複除外)
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* フィルタ */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">メール認証済みのみ表示</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showDuplicatesOnly}
              onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">重複IPのみ表示</span>
          </label>
          <div className="ml-auto text-sm text-gray-600">
            表示中: <span className="font-bold">{filteredResponses.length}</span> / {stats.total}件
          </div>
        </div>
      </div>

      {/* 回答者一覧テーブル */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  送信日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  認証状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IPアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  都道府県
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                filteredResponses.map((response) => {
                  const isDuplicate = isDuplicateIP(response.ipAddress);
                  return (
                    <tr
                      key={response.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        isDuplicate ? 'bg-red-50' : ''
                      }`}
                      onClick={() => setSelectedResponse(response)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(response.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {response.isAnonymous ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            匿名回答
                          </span>
                        ) : response.emailVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            認証済み
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            未認証
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={isDuplicate ? 'text-red-700 font-medium' : 'text-gray-900'}>
                            {response.ipAddress}
                          </span>
                          {isDuplicate && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-200 text-red-800">
                              ⚠️重複検知
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.prefecture || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResponse(response);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedResponse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">回答詳細</h2>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">基本情報</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">メールアドレス:</span> {selectedResponse.email || '匿名'}
                    </div>
                    <div>
                      <span className="font-medium">回答タイプ:</span>{' '}
                      {selectedResponse.isAnonymous ? (
                        <span className="text-gray-600">匿名回答</span>
                      ) : selectedResponse.emailVerified ? (
                        <span className="text-green-600">認証済み</span>
                      ) : (
                        <span className="text-yellow-600">未認証</span>
                      )}
                    </div>
                    {selectedResponse.isAnonymous && (
                      <div className="text-xs text-gray-500 mt-1">
                        ※ ログイン前に回答された匿名回答です
                      </div>
                    )}
                    <div>
                      <span className="font-medium">送信日時:</span> {formatDate(selectedResponse.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">IPアドレス:</span>{' '}
                      <span className={isDuplicateIP(selectedResponse.ipAddress) ? 'text-red-600 font-medium' : ''}>
                        {selectedResponse.ipAddress}
                      </span>
                      {isDuplicateIP(selectedResponse.ipAddress) && (
                        <span className="ml-2 text-red-600">⚠️重複検知</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">User-Agent:</span>{' '}
                      <span className="text-xs text-gray-600">{selectedResponse.userAgent}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">居住情報</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">都道府県:</span> {selectedResponse.prefecture || '-'}
                    </div>
                    <div>
                      <span className="font-medium">市区町村:</span> {selectedResponse.city || '-'}
                    </div>
                    <div>
                      <span className="font-medium">居住年数:</span> {selectedResponse.residenceYears || '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">アンケート回答</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">年齢層:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.ageGroup || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">性別:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.gender || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">お子様の有無:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.hasChildren || '-'}</span>
                  </div>
                  {selectedResponse.childrenCount && (
                    <div>
                      <span className="font-medium text-gray-700">お子様の人数:</span>{' '}
                      <span className="text-gray-900">{selectedResponse.childrenCount}人</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">家族構成:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.familyStructure || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">現在のご職業:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.occupation || '-'}</span>
                  </div>
                  {selectedResponse.employmentType && (
                    <div>
                      <span className="font-medium text-gray-700">雇用形態:</span>{' '}
                      <span className="text-gray-900">{selectedResponse.employmentType}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">現在の年収:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.income || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">選挙の投票頻度:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.votingFrequency || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">政治への満足度:</span>{' '}
                    <span className="text-gray-900">
                      {selectedResponse.politicalSatisfaction
                        ? `${selectedResponse.politicalSatisfaction}/5`
                        : '-'}
                    </span>
                  </div>
                  {selectedResponse.socialIssues && selectedResponse.socialIssues.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">解決してほしい社会課題:</span>
                      <ul className="list-disc list-inside mt-1 text-gray-900">
                        {selectedResponse.socialIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">意見発信への意欲:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.wantsToExpressOpinion || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">議員への応援意欲:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.wantsToSupportPolitician || '-'}</span>
                  </div>
                  {selectedResponse.specificRequest && (
                    <div>
                      <span className="font-medium text-gray-700">具体的な要望:</span>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{selectedResponse.specificRequest}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">税金・社会保険料の負担感:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.taxBurden || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">減税の優先順位:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.taxReductionPriority || '-'}</span>
                  </div>
                  {selectedResponse.politicalWasteRequest && (
                    <div>
                      <span className="font-medium text-gray-700">政治への要望（無駄遣い等）:</span>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedResponse.politicalWasteRequest}
                      </p>
                    </div>
                  )}
                  {selectedResponse.taxThoughts && (
                    <div>
                      <span className="font-medium text-gray-700">税金への意見:</span>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{selectedResponse.taxThoughts}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">外国人材受け入れへの意見:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.foreignWorkersOpinion || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">外国人との共生への不安:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.foreignWorkersConcern || '-'}</span>
                  </div>
                  {selectedResponse.foreignWorkersPolicy && (
                    <div>
                      <span className="font-medium text-gray-700">外国人政策への意見:</span>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedResponse.foreignWorkersPolicy}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">地元議員の活動認知度:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.knowsLocalPolitician || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">意見伝達の方法:</span>{' '}
                    <span className="text-gray-900">{selectedResponse.preferredContactMethod || '-'}</span>
                  </div>
                  {selectedResponse.votingFactors && selectedResponse.votingFactors.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">投票決定要因:</span>
                      <ul className="list-disc list-inside mt-1 text-gray-900">
                        {selectedResponse.votingFactors.map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedResponse.localIssues && (
                    <div>
                      <span className="font-medium text-gray-700">地域の課題:</span>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{selectedResponse.localIssues}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

