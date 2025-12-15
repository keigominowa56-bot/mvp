'use client';
import React, { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
};

export default function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/users', { credentials: 'include' })
      .then(res => res.json())
      .then(setUsers);
  }, []);

  function approve(id: string) {
    fetch(`http://localhost:4000/api/admin/users/${id}/approve`, { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(res => setMsg(res?.ok ? '承認しました' : '失敗'))
      .then(() => setUsers(us => us.map(u => u.id === id ? { ...u, status: 'approved' } : u)));
  }
  function reject(id: string) {
    fetch(`http://localhost:4000/api/admin/users/${id}/reject`, { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(res => setMsg(res?.ok ? '却下しました' : '失敗'))
      .then(() => setUsers(us => us.map(u => u.id === id ? { ...u, status: 'rejected' } : u)));
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ユーザー管理</h1>
      {msg && <div className="text-green-700 p-2">{msg}</div>}
      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th><th>氏名</th><th>メール</th><th>種類</th><th>状態</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name ?? '-'}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                {u.status === 'pending' && (
                  <>
                    <button className="bg-blue-600 text-white px-2 py-1 mr-2" onClick={() => approve(u.id)}>承認</button>
                    <button className="bg-red-500 text-white px-2 py-1" onClick={() => reject(u.id)}>却下</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}