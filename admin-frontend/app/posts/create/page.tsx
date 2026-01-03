'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, uploadMedia } from '@/lib/api';

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('activity');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('画像ファイルは5MB以下にしてください');
        return;
      }
      setImageFile(file);
      setError('');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        setError('動画ファイルは50MB以下にしてください');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const uploadFile = async (file: File, category: string): Promise<string> => {
    try {
      console.log('[CreatePost] ファイルアップロード開始:', { name: file.name, size: file.size, category });
      const result = await uploadMedia(file, category);
      console.log('[CreatePost] ファイルアップロード成功:', result);
      // バックエンドから返されたURLを使用（相対パスの場合はそのまま使用）
      const url = result.url || result.path || '';
      if (!url) {
        throw new Error('アップロードされたファイルのURLが取得できませんでした');
      }
      return url;
    } catch (error: any) {
      console.error('[CreatePost] ファイルアップロードエラー:', error);
      throw new Error(`ファイルのアップロードに失敗しました: ${error.message || '不明なエラー'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploading(true);

    try {
      let imageUrl = '';
      let videoUrl = '';

      // 画像をアップロード
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'post');
      }

      // 動画をアップロード
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'post');
      }

      setUploading(false);

      // 投稿を作成
      await createPost({
        title,
        content,
        type,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
      });

      alert('投稿が成功しました！');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '投稿に失敗しました');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">新規投稿作成</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            投稿タイプ
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="activity">活動報告</option>
            <option value="pledge">公約</option>
            <option value="question">質問</option>
            <option value="news">ニュース</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="投稿のタイトルを入力"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="投稿の内容を入力"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            画像（オプション）
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {imageFile && (
            <p className="text-sm text-gray-600 mt-1">選択: {imageFile.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="video">
            動画（オプション）
          </label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={handleVideoChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {videoFile && (
            <p className="text-sm text-gray-600 mt-1">選択: {videoFile.name}</p>
          )}
        </div>

        {uploading && (
          <div className="mb-4 text-blue-600">
            ファイルをアップロード中...
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? (uploading ? 'アップロード中...' : '投稿中...') : '投稿する'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
