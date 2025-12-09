'use client';
import useSWR from 'swr';
import { fetchComments, createComment, Comment } from '../api';

type Options = {
  targetId: string; // postId を渡してください
};

export function useComments({ targetId }: Options) {
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(
    targetId ? ['/comments', targetId] : null,
    () => fetchComments(targetId),
    { revalidateOnFocus: false },
  );

  async function add(content: string) {
    if (!targetId || !content.trim()) return;
    await createComment({ postId: targetId, content: content.trim() });
    await mutate(); // 再取得
  }

  return {
    comments: data || [],
    isLoading,
    isError: !!error,
    add,
    reload: () => mutate(),
  };
}