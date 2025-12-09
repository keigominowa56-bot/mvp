'use client';
/**
 * 投稿一覧取得 + 作成/更新/削除を扱う SWR フック
 */

import useSWR from 'swr';
import { Post, fetchPosts, createPost, updatePost, deletePost } from '../api';

const KEY = 'posts';

export function usePosts() {
  const { data, error, isLoading, mutate } = useSWR<Post[]>(KEY, fetchPosts, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  async function create(input: { title: string; body: string; tags?: string[] }) {
    const newPost = await createPost(input);
    mutate(
      (current) => {
        const list = current || [];
        return [newPost, ...list];
      },
      false,
    );
    mutate(); // 正式再取得
    return newPost;
  }

  async function update(id: string, input: { title?: string; body?: string; tags?: string[] }) {
    const updated = await updatePost(id, input);
    mutate(
      (current) => (current || []).map((p) => (p.id === id ? updated : p)),
      false,
    );
    mutate();
    return updated;
  }

  async function remove(id: string) {
    await deletePost(id);
    mutate(
      (current) => (current || []).filter((p) => p.id !== id),
      false,
    );
    mutate();
  }

  return {
    posts: data || [],
    loading: isLoading,
    error,
    create,
    update,
    remove,
    refresh: () => mutate(),
  };
}