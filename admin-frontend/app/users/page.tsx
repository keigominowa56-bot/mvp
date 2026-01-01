'use client';
import React, { useEffect, useState } from 'react';
import { fetchUsers, approveUser, rejectUser, allowEngagement, revokeEngagement } from '@/lib/api';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  allowedEngagement?: boolean;
};

export default function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMsg('ログインが必要です');
      return;
    }
    fetchUsers()
      .then(setUsers)
      .catch(err => {
        console.error('ユーザー一覧取得に失敗:', err);
        setMsg('ユーザー一覧の取得に失敗しました');
      });
  }, []);

  async function approve(id: string) {
    try {
      await approveUser(id);
      setMsg('承認しました');
      setUsers(us => us.map(u => u.id === id ? { ...u, status: 'approved' } : u));
    } catch (err) {
      setMsg('承認に失敗しました');
      console.error('承認エラー:', err);
    }
  }
  
  async function reject(id: string) {
    try {
      await rejectUser(id);
      setMsg('却下しました');
      setUsers(us => us.map(u => u.id === id ? { ...u, status: 'rejected' } : u));
    } catch (err) {
      setMsg('却下に失敗しました');
      console.error('却下エラー:', err);
    }
  }
  
  async function allowEngagementForUser(id: string) {
    try {
      await allowEngagement(id);
      setMsg('投稿分析を許可しました');
      setUsers(us => us.map(u => u.id === id ? { ...u, allowedEngagement: true } : u));
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('投稿分析許可に失敗しました');
      console.error('投稿分析許可エラー:', err);
    }
  }
  
  async function revokeEngagementForUser(id: string) {
    if (!confirm('投稿分析の許可を解除しますか？')) return;
    try {
      await revokeEngagement(id);
      setMsg('投稿分析の許可を解除しました');
      setUsers(us => us.map(u => u.id === id ? { ...u, allowedEngagement: false } : u));
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('投稿分析解除に失敗しました');
      console.error('投稿分析解除エラー:', err);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ユーザー管理</h1>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold mb-2">操作説明</h2>
        <ul className="text-sm space-y-1">
          <li><strong>承認:</strong> ユーザーのアカウントを有効化します。承認後、ユーザーはログインしてサービスを利用できます。</li>
          <li><strong>却下:</strong> ユーザーのアカウントを却下します。却下後、ユーザーはログインできなくなります。</li>
          <li><strong>投稿分析許可:</strong> 議員に対して投稿分析機能の使用を許可します（SaaS契約時など）。</li>
          <li><strong>投稿分析解除:</strong> 議員の投稿分析機能の使用許可を解除します（解約時など）。</li>
        </ul>
      </div>
      {msg && <div className="text-green-700 p-2">{msg}</div>}
      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th><th>氏名</th><th>メール</th><th>種類</th><th>状態</th><th>投稿分析</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="text-xs">{u.id.slice(0, 8)}...</td>
              <td>{u.name ?? '-'}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>{u.allowedEngagement ? '✓' : '-'}</td>
              <td>
                <div className="flex flex-col gap-1">
                  {u.status === 'pending' && (
                    <>
                      <button className="bg-blue-600 text-white px-2 py-1 text-xs" onClick={() => approve(u.id)}>承認</button>
                      <button className="bg-red-500 text-white px-2 py-1 text-xs" onClick={() => reject(u.id)}>却下</button>
                    </>
                  )}
                  {u.role?.toLowerCase() === 'politician' && (
                    <>
                      {!u.allowedEngagement ? (
                        <button className="bg-green-600 text-white px-2 py-1 text-xs" onClick={() => allowEngagementForUser(u.id)}>投稿分析許可</button>
                      ) : (
                        <button className="bg-orange-600 text-white px-2 py-1 text-xs" onClick={() => revokeEngagementForUser(u.id)}>投稿分析解除</button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}