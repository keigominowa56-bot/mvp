'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

export default function PoliticianPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/politicians/${params.id}`).then(r => r.json()).then(setProfile);
  }, [params.id]);

  if (!profile) return <div>読み込み中…</div>;

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold">{profile.user?.name}</h1>
      <p className="text-sm text-gray-500">{profile.party?.name ?? '無所属'}</p>
      <p className="mt-2 whitespace-pre-wrap">{profile.bio ?? 'プロフィール未設定'}</p>
      <h2 className="text-lg font-semibold mt-4">公約</h2>
      <ul className="list-disc pl-5">
        {(profile.pledges ?? []).map((p: any, i: number) => <li key={i}>{p.title}</li>)}
      </ul>
    </div>
  );
}