'use client';
import { useAuth } from '../contexts/AuthContext';

export default function AuthActions() {
  const { isLoggedIn, user, logout } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="flex gap-3 text-sm">
        <a className="hover:text-brand-600" href="/login">Login</a>
        <a className="hover:text-brand-600" href="/register">Register</a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-600">{user?.email} / {user?.role}</span>
      <button onClick={logout} className="px-3 py-1 rounded border hover:bg-slate-50">ログアウト</button>
    </div>
  );
}