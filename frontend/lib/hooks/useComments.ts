'use client';

import useSWR from 'swr';
import { fetchComments, createComment, Comment } from '../api';

export function useComments(postId: string) {
  const key = `/posts/${postId}/comments`;
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(key, () => fetchComments(postId));

  async function addComment(payload: { text: string; mediaIds?: string[]; mentions?: string[]; parentId?: string | null }) {
    await createComment(postId, payload);
    await mutate();
  }

  return {
    comments: data || [],
    error,
    isLoading,
    addComment,
    mutate,
  };
}

export { useComments }