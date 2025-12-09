'use client';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

type SearchResult = {
  posts: Array<{ id: string; title?: string; body: string; createdAt: string }>;
  users: Array<{ id: string; name?: string; email: string; role: string; party?: string; addressPref?: string; addressCity?: string }>;
};

async function fetchSearch(params: URLSearchParams): Promise<SearchResult> {
  const res = await fetch(`/search?${params.toString()}`);
  if (!res.ok) throw new Error('検索に失敗しました');
  return res.json();
}

export default function SearchPage() {
  const sp = useSearchParams();
  const params = new URLSearchParams();
  const q = sp.get('q') || '';
  const party = sp.get('party') || '';
  const pref = sp.get('pref') || '';
  const city = sp.get('city') || '';
  if (q) params.set('q', q);
  if (party) params.set('party', party);
  if (pref) params.set('pref', pref);
  if (city) params.set('city', city);

  const { data, error, isLoading } = useSWR<SearchResult>(
    ['/search', q, party, pref, city],
    () => fetchSearch(params),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">検索結果</h1>

      <div className="card">
        <h2 className="font-medium mb-2">投稿</h2>
        {isLoading && <div className="text-sm text-slate-500">読み込み中...</div>}
        {error && <div className="text-sm text-red-600">検索に失敗しました</div>}
        <ul className="space-y-2">
          {data?.posts?.map((p) => (
            <li key={p.id} className="text-sm">
              <div className="font-medium">{p.title || p.body.slice(0, 40)}</div>
              <div className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</div>
            </li>
          ))}
          {data && data.posts?.length === 0 && <div className="text-sm text-slate-500">該当する投稿はありません。</div>}
        </ul>
      </div>

      <div className="card">
        <h2 className="font-medium mb-2">ユーザー</h2>
        <ul className="space-y-2">
          {data?.users?.map((u) => (
            <li key={u.id} className="text-sm">
              <div className="font-medium">{u.name || '(名称未設定)'} {u.party ? ` [${u.party}]` : ''}</div>
              <div className="text-xs text-slate-500">{u.email} / {u.role} / {u.addressPref || ''} {u.addressCity || ''}</div>
            </li>
          ))}
          {data && data.users?.length === 0 && <div className="text-sm text-slate-500">該当するユーザーはありません。</div>}
        </ul>
      </div>
    </div>
  );
}