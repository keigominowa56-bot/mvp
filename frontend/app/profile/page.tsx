'use client';
import useSWR from 'swr';
import { getMe, Me } from '../../lib/api';

export default function ProfilePage() {
  const { data, error, isLoading } = useSWR<Me>('/auth/me', getMe);

  if (isLoading) return <div className="text-sm text-slate-500">読み込み中...</div>;
  if (error) return <div className="text-sm text-red-600">読み込みに失敗しました</div>;

  const me: any = data;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">プロフィール</h1>
      <div className="card">
        <div className="text-sm"><span className="text-slate-500">メール:</span> {me.email}</div>
        <div className="text-sm"><span className="text-slate-500">役割:</span> {me.role}</div>
        <div className="text-sm"><span className="text-slate-500">氏名:</span> {me.name || '-'}</div>
        <div className="text-sm"><span className="text-slate-500">年齢:</span> {me.age ?? '-'}</div>
        <div className="text-sm"><span className="text-slate-500">住所:</span> {me.addressPref || '-'} {me.addressCity || ''}</div>
        <div className="text-sm"><span className="text-slate-500">KYC:</span> {me.kycStatus}</div>
        <div className="text-sm"><span className="text-slate-500">プラン:</span> {me.planTier}</div>
      </div>
    </div>
  );
}