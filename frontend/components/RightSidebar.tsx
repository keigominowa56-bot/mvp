'use client';
import SearchSidebar from './SearchSidebar';
import RecommendedUsersPanel from './RecommendedUsersPanel';

export default function RightSidebar() {
  return (
    <aside className="space-y-4">
      <SearchSidebar />
      <RecommendedUsersPanel />
    </aside>
  );
}