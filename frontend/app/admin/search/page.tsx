'use client';

import { useEffect, useState } from 'react';
import api, { unwrap } from '../../lib/api';

type PostItem = {
  id: string;
  title?: string;
  body: string;
  postCategory: 'policy' | 'activity';
  regionPref?: string;
  regionCity?: string;
  createdAt: string;
};

type NotificationItem = {
  id: string;
  title: string;
  type: string;
  body?: string;
  createdAt: string;
};

export default function AdminSearchPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<'all' | 'policy' | 'activity'>('all');
  const [pref, setPref] = useState('');
  const [city, setCity] = useState('');

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const resPosts = await api.get('/admin/search/posts', {
        params: {
          q: q || undefined,
          category: category === 'all' ? undefined : category,
          pref: pref || undefined,
          city: city || undefined,
        },
      });
      const resN = await api.get('/admin/search/notifications', {
        params: { q: q || undefined },
      });
      setPosts(unwrap<PostItem[]>(resPosts));
      setNotifications(unwrap<NotificationItem[]>(resN));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 初期ロード
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">検索・フィルタ</h1>
      <div className="flex gap-2">
        <input className="border px-2 py-1 w-64" placeholder="キーワード" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border px-2 py-1" value={category} onChange={(e) => setCategory(e.target.value as any)}>
          <option value="all">すべて</option>
          <option value="policy">政策</option>
          <option value="activity">活動</option>
        </select>
        <input className="border px-2 py-1" placeholder="都道府県" value={pref} onChange={(e) => setPref(e.target.value)} />
        <input className="border px-2 py-1" placeholder="市区町村" value={city} onChange={(e) => setCity(e.target.value)} />
        <button className="border px-3 py-1 rounded" onClick={search} disabled={loading}>
          {loading ? '検索中...' : '検索'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-medium">投稿</h2>
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{p.title || '(無題)'}</div>
                <div className="text-xs text-slate-500">
                  {p.postCategory} / {p.regionPref || '-'} {p.regionCity || ''}
                </div>
                <div className="text-xs">{p.body.slice(0, 120)}...</div>
              </li>
            ))}
            {!loading && posts.length === 0 && <li className="text-xs text-slate-500">該当する投稿がありません</li>}
          </ul>
        </div>
        <div>
          <h2 className="font-medium">通知</h2>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-slate-500">{n.type}</div>
                <div className="text-xs">{(n.body || '').slice(0, 120)}...</div>
              </li>
            ))}
            {!loading && notifications.length === 0 && <li className="text-xs text-slate-500">該当する通知がありません</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}