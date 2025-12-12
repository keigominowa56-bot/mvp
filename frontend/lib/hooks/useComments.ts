import useSWR from 'swr';
import { fetchComments, createComment } from '../api';

export type Comment = {
  id: string;
  authorUserId: string;
  content: string;
  createdAt: string;
  mediaIds?: string[];
  mentions?: string[];
};

export function useComments(postId: string) {
  const { data, error, mutate } = useSWR<Comment[]>(`/posts/${postId}/comments`, () => fetchComments(postId));
  return {
    comments: data || [],
    isLoading: !data && !error,
    error,
    mutate,
    create: async (payload: { text: string; mediaIds?: string[]; mentions?: string[] }) => {
      await createComment(postId, payload);
      await mutate();
    },
  };
}