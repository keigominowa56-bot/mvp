'use client';
import React, { useEffect, useState } from 'react';

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
    fetch('http://localhost:4000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(setUsers);
  }, []);

  function approve(id: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMsg('ログインが必要です');
      return;
    }
    fetch(`http://localhost:4000/api/admin/users/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => setMsg(res?.ok ? '承認しました' : '失敗'))
      .then(() => setUsers(us => us.map(u => u.id === id ? { ...u, status: 'approved' } : u)));
  }
  function reject(id: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMsg('ログインが必要です');
      return;
    }
    fetch(`http://localhost:4000/api/admin/users/${id}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => setMsg(res?.ok ? '却下しました' : '失敗'))
      .then(() => setUsers(us => us.map(u => u.id === id ? { ...u, status: 'rejected' } : u)));
  }
  function allowEngagement(id: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMsg('ログインが必要です');
      return;
    }
    fetch(`http://localhost:4000/api/admin/users/${id}/allow-engagement`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => setMsg(res?.ok ? '投稿分析を許可しました' : '失敗'))
      .then(() => {
        setUsers(us => us.map(u => u.id === id ? { ...u, allowedEngagement: true } : u));
        setTimeout(() => setMsg(''), 3000);
      });
  }
  function revokeEngagement(id: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMsg('ログインが必要です');
      return;
    }
    if (!confirm('投稿分析の許可を解除しますか？')) return;
    fetch(`http://localhost:4000/api/admin/users/${id}/revoke-engagement`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => setMsg(res?.ok ? '投稿分析の許可を解除しました' : '失敗'))
      .then(() => {
        setUsers(us => us.map(u => u.id === id ? { ...u, allowedEngagement: false } : u));
        setTimeout(() => setMsg(''), 3000);
      });
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
                  {u.role === 'politician' && (
                    <>
                      {!u.allowedEngagement ? (
                        <button className="bg-green-600 text-white px-2 py-1 text-xs" onClick={() => allowEngagement(u.id)}>投稿分析許可</button>
                      ) : (
                        <button className="bg-orange-600 text-white px-2 py-1 text-xs" onClick={() => revokeEngagement(u.id)}>投稿分析解除</button>
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