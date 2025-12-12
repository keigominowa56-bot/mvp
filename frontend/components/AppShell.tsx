'use client';

import { LeftSidebar } from './LeftSidebar';
import { RightSidebarFilters } from './RightSidebarFilters';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-2">
        <LeftSidebar />
      </div>
      <main className="col-span-12 md:col-span-8" aria-label="メインコンテンツ">
        {children}
      </main>
      <div className="col-span-12 md:col-span-2">
        <RightSidebarFilters />
      </div>
    </div>
  );
}

export { AppShell }