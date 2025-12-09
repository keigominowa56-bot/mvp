// frontend/components/timeline/PostList.tsx

'use client'; 

import React, { useState, useEffect } from 'react';
import { Post } from '@/types/data';
import { fetchTimelineData } from '@/utils/fakeApi';
import PostItem from './PostItem';
import PostForm from './PostForm'; // 🚨 正しいパス

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleNewPost = (newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchTimelineData();
                setPosts(data);
            } catch (err) {
                console.error("Failed to fetch timeline data:", err);
                setError("タイムラインデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };
        loadPosts();
    }, []);

    if (isLoading) {
        return null; 
    }

    if (error) {
        return <div className="text-center text-red-500 p-8">{error}</div>;
    }

    if (posts.length === 0) {
        return (
            <div className="text-center text-gray-500 p-8 border rounded-lg bg-white shadow-sm dark:bg-gray-800">
                <p className="font-semibold mb-2">まだ投稿がありません。</p>
                <p className="text-sm">最初の投稿を作成してみましょう。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PostForm onPostCreated={handleNewPost} />
            
            {posts.map(post => (
                <PostItem key={post.id} post={post} />
            ))}
        </div>
    );
}
