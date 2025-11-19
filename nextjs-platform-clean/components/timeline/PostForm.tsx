// frontend/components/timeline/PostForm.tsx
'use client';

import React, { useState } from 'react';
import { Post } from '@/types/data';
import { createPost } from '@/utils/fakeApi';

interface PostFormProps {
    onPostCreated: (post: Post) => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newPost = await createPost(content, null);
            onPostCreated(newPost);
            setContent('');
        } catch (err) {
            setError('投稿に失敗しました。時間をおいて再試行してください。');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder="いま、あなたの政治に関する意見を聞かせてください..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="mt-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                            content.trim() && !isSubmitting
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                        }`}
                    >
                        {isSubmitting ? '投稿中...' : '投稿する'}
                    </button>
                </div>
            </form>
        </div>
    );
}
