'use client';

import PostCreateForm from '../../../../components/PostCreateForm';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AdminPostNewPage() {
  const { user, ready, isLoggedIn } = useAuth();

  if (!ready) return <div className="p-4 text-sm text-slate-500">読み込み中...</div>;
  if (!isLoggedIn) return <div className="p-4 text-sm text-slate-500">ログインしてください</div>;
  if (user?.role !== 'admin' && user?.role !== 'politician')
    return <div className="p-4 text-sm text-red-600">権限がありません（admin / politician 専用）</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">新規投稿</h1>
      <PostCreateForm />
    </div>
  );
}