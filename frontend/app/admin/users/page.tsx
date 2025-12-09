'use client';

import useSWR from 'swr';
import { useEffect, useState, useCallback } from 'react';
import {
  adminFetchUsers,
  adminUpdateUser,
  AdminUserSummary,
  AdminUsersResponse,
} from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const fetcher = async (key: string) => {
  // key 例: /admin/users?q=&role=&status=&page=1&perPage=20
  const url = new URL(key, window.location.origin);
  const params: any = {};
  url.searchParams.forEach((v, k) => {
    if (v) params[k] = v;
  });
  return adminFetchUsers(params);
};

export default function AdminUsersPage() {
  const { user, isLoggedIn, ready } = useAuth();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const key = `/admin/users?q=${encodeURIComponent(q)}&role=${encodeURIComponent(
    role,
  )}&status=${encodeURIComponent(status)}&page=${page}&perPage=${perPage}`;

  const { data, error, isLoading, mutate } = useSWR<AdminUsersResponse>(ready && isLoggedIn ? key : null, fetcher);

  useEffect(() => {
    // 管理者以外は何も表示しない
  }, [user]);

  const onChangeField = useCallback(
    async (id: string, patch: Partial<{ role: string; status: string }>) => {
      try {
        await adminUpdateUser(id, patch);
        mutate();
      } catch (e: any) {
        alert('更新失敗: ' + (e?.response?.data?.message ?? e?.message ?? 'unknown'));
      }
    },
    [mutate],
  );

  if (!ready) return <div className="p-4 text-sm text-slate-500">読み込み中...</div>;
  if (!isLoggedIn) return <div className="p-4 text-sm text-slate-500">ログインしてください</div>;
  if (user?.role !== 'admin')
    return <div className="p-4 text-sm text-red-600">権限がありません（admin専用）</div>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold">ユーザー管理</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          mutate();
        }}
        className="flex flex-wrap gap-2 items-end"
      >
        <div className="flex flex-col">
          <label className="text-xs">検索</label>
            <input
              className="border px-2 py-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="メール/名前など"
            />
        </div>
        <div className="flex flex-col">
          <label className="text-xs">ロール</label>
          <select
            className="border px-2 py-1"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">すべて</option>
            <option value="admin">admin</option>
            <option value="politician">politician</option>
            <option value="user">user</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs">ステータス</label>
          <select
            className="border px-2 py-1"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">すべて</option>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
          </select>
        </div>
        <button className="border px-3 py-1 rounded text-sm">検索</button>
      </form>

      {isLoading && <div className="text-sm">読み込み中...</div>}
      {error && <div className="text-sm text-red-600">取得失敗: {(error as any)?.message}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-[600px] text-sm border">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-1 text-left">ID</th>
              <th className="border px-2 py-1 text-left">Email</th>
              <th className="border px-2 py-1 text-left">Role</th>
              <th className="border px-2 py-1 text-left">Status</th>
              <th className="border px-2 py-1 text-left">Created</th>
              <th className="border px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((u: AdminUserSummary) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.id.slice(0, 8)}…</td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">
                  <select
                    className="border px-1 py-0.5 text-xs"
                    value={u.role}
                    onChange={(e) => onChangeField(u.id, { role: e.target.value })}
                  >
                    <option value="admin">admin</option>
                    <option value="politician">politician</option>
                    <option value="user">user</option>
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <select
                    className="border px-1 py-0.5 text-xs"
                    value={u.status}
                    onChange={(e) => onChangeField(u.id, { status: e.target.value })}
                  >
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                </td>
                <td className="border px-2 py-1">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="border px-2 py-1">
                  <button
                    className="text-xs underline"
                    onClick={() => alert(`詳細表示は後で実装 (userId=${u.id})`)}
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
            {!data?.items?.length && !isLoading && (
              <tr>
                <td colSpan={6} className="border px-2 py-3 text-center text-slate-500">
                  対象ユーザーなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > perPage && (
        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border px-2 py-1 rounded disabled:opacity-50"
          >
            前へ
          </button>
          <span className="text-xs">
            {page} / {Math.ceil(data.total / perPage)} ページ
          </span>
          <button
            disabled={page >= Math.ceil(data.total / perPage)}
            onClick={() => setPage((p) => p + 1)}
            className="border px-2 py-1 rounded disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}