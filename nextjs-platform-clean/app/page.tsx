// frontend/app/page.tsx

import PostList from '@/components/timeline/PostList';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * @page / (認証後のホーム画面/ダッシュボード)
 */
export default function DashboardPage() {
  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 hidden md:block">ダッシュボード</h1>
      
      {/* タイムラインコンポーネント */}
      <Suspense fallback={
          <div className="text-center p-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">タイムラインの準備中...</p>
          </div>
      }>
        <PostList />
      </Suspense>
    </main>
  );
}