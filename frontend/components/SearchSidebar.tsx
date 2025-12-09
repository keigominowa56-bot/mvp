'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPrefectureNames, getCitiesByPrefName } from '../lib/geoJP';
import { useRouter, useSearchParams } from 'next/navigation';

const PARTIES = ['自民党', '立憲民主党', '日本維新の会', '公明党', '共産党', '国民民主党', 'れいわ新選組', '社民党', '無所属'];

export default function SearchSidebar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [party, setParty] = useState(sp.get('party') || '');
  const [prefName, setPrefName] = useState(sp.get('pref') || '');
  const [city, setCity] = useState(sp.get('city') || '');

  const [prefNames, setPrefNames] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    getPrefectureNames().then(setPrefNames).catch(console.error);
  }, []);

  useEffect(() => {
    if (!prefName) { setCities([]); setCity(''); return; }
    getCitiesByPrefName(prefName).then((list) => {
      setCities(list);
      if (!list.includes(city)) setCity('');
    });
  }, [prefName]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (party) params.set('party', party);
    if (prefName) params.set('pref', prefName);
    if (city) params.set('city', city);
    router.push(`/search${params.toString() ? `?${params}` : ''}`);
  }

  function reset() {
    setQ(''); setParty(''); setPrefName(''); setCity('');
    router.push('/search');
  }

  return (
    <div className="card space-y-3 sticky top-4">
      <h3 className="font-medium text-sm">検索</h3>
      <form onSubmit={submit} className="space-y-2">
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="キーワード（投稿/ユーザー）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="w-full border rounded px-3 py-2 text-sm" value={party} onChange={(e) => setParty(e.target.value)}>
          <option value="">政党（任意）</option>
          {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="w-full border rounded px-3 py-2 text-sm" value={prefName} onChange={(e) => setPrefName(e.target.value)}>
          <option value="">都道府県（任意）</option>
          {prefNames.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="w-full border rounded px-3 py-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)} disabled={!prefName}>
          <option value="">{prefName ? '市区町村（任意）' : '都道府県を先に選択'}</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="flex-1 text-sm px-3 py-2 border rounded" type="submit">検索</button>
          <button className="flex-1 text-sm px-3 py-2 border rounded" type="button" onClick={reset}>リセット</button>
        </div>
      </form>
    </div>
  );
}