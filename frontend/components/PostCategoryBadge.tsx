'use client';

import React from 'react';

export default function PostCategoryBadge({ category }: { category: 'policy' | 'activity' }) {
  const label = category === 'policy' ? '政策' : '活動報告';
  const color = category === 'policy' ? 'bg-blue-600' : 'bg-green-600';
  return (
    <span className={`inline-block text-xs text-white px-2 py-1 rounded ${color}`}>
      {label}
    </span>
  );
}