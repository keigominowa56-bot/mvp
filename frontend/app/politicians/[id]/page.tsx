'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetchPoliticianProfile } from '../../lib/api-extended';
import Link from 'next/link';

function Badge({ text, variant='default' }: { text: string; variant?: string }) {
  const colors: Record<string,string> = {
    default: 'bg-slate-200 text-slate-700',
    pending: 'bg-yellow-200 text-yellow-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    achieved: 'bg-green-200 text-green-800',
    abandoned: 'bg-red-200 text-red-800',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors[variant] || colors.default}`}>{text}</span>;
}

export default function PoliticianProfilePage() {
  const { id } = useParams() as { id: string };
  const { data, error } = useSWR(id ? ['politicianProfile', id] : null, () => fetchPoliticianProfile(id));

  if (error) return <div className="text-sm text-red-600">取得に失敗しました</div>;
  if (!data) return <div className="text-sm text-slate-500">読み込み中...</div>;
  if (data.error) return <div className="text-sm text-slate-500">政治家ではありません。</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{data.name || '(名称未設定)'} <span className="text-sm text-slate-500">{data.kana}</span></h1>
      <div className="card space-y-2 text-sm">
        <div>党 / 会派: {data.party || '-'}</div>
        <div>選挙区: {data.constituency || '-'}</div>
        <div>当選回数: {data.termCount ?? '-'}</div>
        <div>フォロワー数: {data.followerCount}</div>
        <div className="flex gap-2 flex-wrap text-xs">
          {data.xHandle && <a className="underline" href={`https://x.com/${data.xHandle}`} target="_blank">X</a>}
          {data.instagramHandle && <a className="underline" href={`https://instagram.com/${data.instagramHandle}`} target="_blank">Instagram</a>}
          {data.facebookUrl && <a className="underline" href={data.facebookUrl} target="_blank">Facebook</a>}
            {data.youtubeUrl && <a className="underline" href={data.youtubeUrl} target="_blank">YouTube</a>}
          {data.websiteUrl && <a className="underline" href={data.websiteUrl} target="_blank">公式サイト</a>}
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-medium text-sm">公約</h2>
        {data.policies.length === 0 && <div className="text-xs text-slate-500">公約なし</div>}
        <ul className="space-y-2">
          {data.policies.map((p: any) => (
            <li key={p.id} className="border rounded p-2 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{p.title}</span>
                <Badge text={p.status} variant={p.status} />
                {p.category && <Badge text={p.category} />}
              </div>
              <div>{p.description || '(説明なし)'}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <h2 className="font-medium text-sm">政治資金</h2>
        <div className="text-xs">合計: {data.funding.total} 円</div>
        <ul className="text-xs">
          {Object.entries(data.funding.summary).map(([cat, amt]: any) => (
            <li key={cat}>{cat}: {amt} 円</li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <h2 className="font-medium text-sm">最新投稿</h2>
        {data.posts.length === 0 && <div className="text-xs text-slate-500">投稿なし</div>}
        <ul className="space-y-2">
          {data.posts.map((p: any) => (
            <li key={p.id} className="border rounded p-2 text-xs">
              <div className="font-semibold">{p.title || '(無題)'}</div>
              <div>{p.body.slice(0,120)}{p.body.length>120?'…':''}</div>
              <div className="text-[10px] text-slate-500">{p.createdAt}</div>
              <Link className="underline text-[10px]" href={`/posts/${p.id}`}>詳細</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}