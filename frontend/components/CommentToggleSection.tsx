'use client';

import { useState } from 'react';
import CommentsSection from './CommentsSection';

type Props = { postId: string };

export default function CommentToggleSection({ postId }: Props) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-blue-600 hover:text-blue-800 mb-2"
      >
        {showComments ? 'コメントを非表示' : 'コメントを表示'}
      </button>
      {showComments && <CommentsSection postId={postId} />}
    </div>
  );
}

