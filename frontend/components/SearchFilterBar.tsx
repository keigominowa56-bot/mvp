'use client';

import { useState } from 'react';

export interface FilterState {
  q?: string;
  category?: 'policy' | 'activity';
  read?: 'all' | 'unread';
}

export default function SearchFilterBar({ onChange }: { onChange: (f: FilterState) => void }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<FilterState['category']>();
  const [read, setRead] = useState<FilterState['read']>('all');

  function apply() {
    onChange({ q: q || undefined, category, read });
  }

  return (
    <div className="flex flex-wrap gap-2 items-center border rounded p-2">
      <input
        className="border px-2 py-1 text-sm"
        placeholder="キーワード"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="border px-2 py-1 text-sm"
        value={category || ''}
        onChange={(e) => setCategory((e.target.value || undefined) as any)}
      >
        <option value="">すべて</option>
        <option value="policy">政策</option>
        <option value="activity">活動</option>
      </select>
      <select className="border px-2 py-1 text-sm" value={read} onChange={(e) => setRead(e.target.value as any)}>
        <option value="all">すべて</option>
        <option value="unread">未読のみ</option>
      </select>
      <button className="border px-3 py-1 text-sm rounded" onClick={apply}>
        検索/適用
      </button>
    </div>
  );
}