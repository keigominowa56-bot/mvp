'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function RightSidebarFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [type, setType] = useState<string>(params.get('type') || '');
  const [region, setRegion] = useState<string>(params.get('region') || '');
  const [q, setQ] = useState<string>(params.get('q') || '');

  useEffect(() => {
    setType(params.get('type') || '');
    setRegion(params.get('region') || '');
    setQ(params.get('q') || '');
  }, [params]);

  function apply() {
    const qs = new URLSearchParams();
    if (type) qs.set('type', type);
    if (region) qs.set('region', region);
    if (q) qs.set('q', q);
    router.push(`/feed${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  return (
    <aside className="bg-white border rounded p-3" aria-label="フィルタ">
      <h2 className="font-semibold mb-2">フィルタ</h2>
      <div className="flex flex-col gap-2">
        <select className="border rounded px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">すべて</option>
          <option value="activity">活動報告</option>
          <option value="pledge">公約</option>
          <option value="question">質問</option>
          <option value="news">ニュース</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder="地域（IDまたは名称）" value={region} onChange={(e)=>setRegion(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="キーワード" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="rounded bg-gray-800 text-white px-3 py-1" onClick={apply}>適用</button>
      </div>
    </aside>
  );
}

export { RightSidebarFilters }