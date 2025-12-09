import React from 'react';
import ReactionButtons from './ReactionButtons';
import CommentsSection from './CommentsSection';

type Media = { images?: string[]; video?: string } | null;
export type PostProps = {
  id: number;
  body: string;
  media?: Media;
  createdAt: string;
};

export default function PostCard({ id, body, media, createdAt }: PostProps) {
  return (
    <article className="tw-card p-4 fade-in">
      <header className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">POST #{id}</span>
        <span className="text-[10px] text-gray-400">{new Date(createdAt).toLocaleString()}</span>
      </header>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{body}</p>

      {media?.images && media.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          {media.images.map((img, i) => (
            <div
              key={i}
              className="relative h-24 bg-gray-100 border rounded flex items-center justify-center text-[10px] text-gray-600"
            >
              {img}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ReactionButtons postId={id} />
      </div>

      <CommentsSection postId={id} />
    </article>
  );
}