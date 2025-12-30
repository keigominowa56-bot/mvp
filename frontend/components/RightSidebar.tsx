'use client';
import { Suspense } from 'react';
import SearchSidebar from './SearchSidebar';
import RecommendedUsersPanel from './RecommendedUsersPanel';

export default function RightSidebar() {
  return (
    <aside className="space-y-4">
      <Suspense fallback={<div className="text-sm text-gray-500">読み込み中...</div>}>
        <SearchSidebar />
      </Suspense>
      <RecommendedUsersPanel />
    </aside>
  );
}