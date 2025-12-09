'use client';
import { useState } from 'react';
import { bulkPostsJSON, bulkPostsCSV } from '../../../lib/api-extended';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminBulkPostsPage() {
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState<'json' | 'csv'>('json');
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみアクセス可能</div>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setResult(null);
    try {
      let res;
      if (mode === 'json') {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('JSONは配列が必要です');
        res = await bulkPostsJSON(parsed);
      } else {
        res = await bulkPostsCSV(text);
      }
      setResult(res);
    } catch (e: any) {
      setErr(e.message || '失敗');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">一括投稿</h1>
      <div className="card space-y-3">
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" value="json" checked={mode === 'json'} onChange={() => setMode('json')} /> JSON
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" value="csv" checked={mode === 'csv'} onChange={() => setMode('csv')} /> CSV
          </label>
        </div>
        <form onSubmit={onSubmit} className="space-y-2 text-sm">
          <textarea
            className="border rounded w-full px-2 py-1 min-h-[200px]"
            placeholder={mode === 'json' ? '[{"title":"...","body":"..."}]' : 'title,body,tags,authorId\n...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="px-3 py-2 border rounded">送信</button>
        </form>
        {err && <div className="text-xs text-red-600">{err}</div>}
        {result && (
          <div className="text-xs space-y-1">
            <div>結果: {result.count}件</div>
            <ul className="max-h-48 overflow-auto space-y-1">
              {result.results.map((r: any, i: number) => (
                <li key={i} className={r.created ? 'text-green-600' : r.error ? 'text-red-600' : ''}>
                  #{r.index} {r.created ? `作成 (id=${r.id})` : r.error || 'スキップ'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}