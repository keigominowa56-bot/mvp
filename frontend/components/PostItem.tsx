import React from 'react';
import { Post } from '../lib/api';

export function PostItem({ post }: { post: Post }) {
  const postCategory = post.postCategory || 'activity';
  const badgeColor =
    postCategory === 'policy' ? 'bg-blue-600' : 'bg-green-600';
  const bodyText = post.body || post.content || '';
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-xs text-white px-2 py-1 rounded ${badgeColor}`}>
          {postCategory === 'policy' ? '政策' : '活動報告'}
        </span>
        {post.visibility === 'hidden' && (
          <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">非公開</span>
        )}
      </div>
      {post.title && <h3 className="font-semibold">{post.title}</h3>}
      <p className="text-sm whitespace-pre-line">{bodyText}</p>
    </div>
  );
}