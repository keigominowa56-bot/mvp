'use client';
import { useState } from 'react';
import { adminBulkPoliticiansCSV, adminBulkPoliticiansJSON, BulkResult } from '../../../../lib/api';

export default function AdminPoliticiansImportPage() {
  const [mode, setMode] = useState<'csv' | 'json'>('csv');
  const [text, setText] = useState('');
  const [result, setResult] = useState<BulkResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setResult(null);
    try {
      let res: BulkResult;
      if (mode === 'csv') {
        if (!text.trim()) throw new Error('CSVテキストを入力してください');
        res = await adminBulkPoliticiansCSV(text);
      } else {
        const json = JSON.parse(text);
        if (!Array.isArray(json)) throw new Error('JSONは配列で入力してください');
        res = await adminBulkPoliticiansJSON(json);
      }
      setResult(res);
    } catch (e: any) {
      setErr(e?.message || 'インポートに失敗しました');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">政治家インポート</h1>
      <div className="card space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="csv" checked={mode === 'csv'} onChange={() => setMode('csv')} />
            CSVでインポート
          </label>
          <a className="text-blue-600 underline" href="/admin/politician-import-template.csv" target="_blank" rel="noopener noreferrer">CSVテンプレート</a>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="json" checked={mode === 'json'} onChange={() => setMode('json')} />
            JSON配列でインポート
          </label>
        </div>
        <form onSubmit={onSubmit} className="space-y-2">
          <textarea
            className="w-full border rounded px-3 py-2 text-sm min-h-[220px]"
            placeholder={mode === 'csv' ? 'email,name,party,addressPref,addressCity,password\n...' : '[{ "email": "...", "name": "...", "party": "...", "addressPref": "...", "addressCity": "...", "password": "..." } ]'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="px-4 py-2 border rounded text-sm">インポート</button>
        </form>
        {err && <div className="text-sm text-red-600">{err}</div>}
        {result && (
          <div className="text-sm">
            <div className="font-medium mb-1">結果: {result.count}件</div>
            <ul className="space-y-1 max-h-64 overflow-auto">
              {result.results.map((r, i) => (
                <li key={i} className={r.created ? 'text-green-600' : r.error ? 'text-red-600' : ''}>
                  {r.email} - {r.created ? '作成' : r.error ? `失敗 (${r.error})` : '既存スキップ'} {r.id ? `(id: ${r.id})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">
        パスワード未指定の場合はランダム生成されます。作成後のパスワード共有は別途ご手配ください。
      </p>
    </div>
  );
}