'use client';
import useSWRInfinite from 'swr/infinite';
import { API_BASE } from '../../lib/api';

type Post = {
  id: string;
  title: string;
  content: string;
  type: string;
  authorUserId: string;
  createdAt: string;
};

const PAGE_SIZE = 20;
const getKey = (pageIndex: number, previousPageData: Post[]) => {
  if (previousPageData && previousPageData.length < PAGE_SIZE) return null;
  const cursor = '';
  return `${API_BASE}/posts?limit=${PAGE_SIZE}&cursor=${cursor}`;
};

export default function TimelinePage() {
  const { data, size, setSize, isValidating } = useSWRInfinite<Post[]>(getKey, (url: string) => fetch(url).then(r => r.json()));
  const posts = (data || []).flat();

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <article key={p.id} className="bg-white border rounded p-3">
          <h2 className="font-semibold">{p.title}</h2>
          <p className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</p>
          <p className="mt-2 whitespace-pre-wrap">{p.content}</p>
        </article>
      ))}
      <button
        className="rounded bg-gray-800 text-white px-3 py-2"
        onClick={() => setSize(size + 1)}
        disabled={isValidating}
      >
        さらに読み込む
      </button>
    </div>
  );
}