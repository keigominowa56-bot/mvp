'use client';
import { useEffect, useState } from 'react';
import { apiFetchWithAuth, unwrap, fetchSurveysAvailable, answerSurvey } from '../../lib/api';

export default function SurveysPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSurveys() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSurveysAvailable();
        // レスポンスの形式に応じて調整
        if (Array.isArray(data)) {
          setList(data);
        } else if (data.surveys && Array.isArray(data.surveys)) {
          setList(data.surveys);
        } else {
          setList([]);
        }
      } catch (err: any) {
        console.error('アンケート取得エラー:', err);
        setError(err.message || 'アンケートの取得に失敗しました');
        if (err.status === 401) {
          setError('ログインが必要です');
        }
      } finally {
        setLoading(false);
      }
    }
    loadSurveys();
  }, []);

  async function respond(id: string) {
    try {
      setError(null);
      await answerSurvey(id, { q1: 'yes' });
      alert('回答しました');
      // リストを再読み込み
      const data = await fetchSurveysAvailable();
      if (Array.isArray(data)) {
        setList(data);
      } else if (data.surveys && Array.isArray(data.surveys)) {
        setList(data.surveys);
      }
    } catch (err: any) {
      console.error('回答エラー:', err);
      const errorMessage = err.message || '回答に失敗しました';
      if (err.status === 401) {
        alert('無効な認証トークンです。再度ログインしてください。');
      } else {
        alert(errorMessage);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">アンケート</h1>
        <div>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">アンケート</h1>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">アンケート</h1>
      {list.length === 0 ? (
        <div>現在、回答可能なアンケートはありません</div>
      ) : (
        list.map((s) => (
          <div key={s.id} className="bg-white border rounded p-3">
            <div className="font-semibold">{s.title}</div>
            <div className="text-sm text-gray-600">{s.description}</div>
            <button className="rounded bg-blue-600 text-white px-3 py-1 mt-2" onClick={()=>respond(s.id)}>回答する</button>
          </div>
        ))
      )}
    </div>
  );
}