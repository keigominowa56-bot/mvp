'use client';
import { useState } from 'react';
import { verifyEmail, sendPhoneCode, verifyPhone } from '../../lib/api-extended';

export default function VerifyPage() {
  const [emailToken, setEmailToken] = useState('');
  const [emailMsg, setEmailMsg] = useState<string|null>(null);
  const [emailErr, setEmailErr] = useState<string|null>(null);

  const [phoneEmail, setPhoneEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneMsg, setPhoneMsg] = useState<string|null>(null);
  const [phoneErr, setPhoneErr] = useState<string|null>(null);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(null); setEmailErr(null);
    try {
      await verifyEmail(emailToken.trim());
      setEmailMsg('メール認証成功');
    } catch (e: any) {
      setEmailErr(e?.response?.data?.message || e.message);
    }
  }

  async function onSendPhone(e: React.FormEvent) {
    e.preventDefault();
    setPhoneMsg(null); setPhoneErr(null);
    try {
      await sendPhoneCode(phoneEmail.trim());
      setPhoneMsg('コード再送信完了。ログに出ています。');
    } catch (e: any) {
      setPhoneErr(e?.response?.data?.message || e.message);
    }
  }

  async function onPhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    setPhoneMsg(null); setPhoneErr(null);
    try {
      await verifyPhone(phoneEmail.trim(), phoneCode.trim());
      setPhoneMsg('電話番号認証成功');
    } catch (e: any) {
      setPhoneErr(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">認証</h1>
      <div className="card space-y-2">
        <h2 className="font-medium text-sm">メール認証</h2>
        <form onSubmit={onEmail} className="flex gap-2">
          <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="メールトークン" value={emailToken} onChange={(e) => setEmailToken(e.target.value)} />
          <button className="border rounded px-3 py-1 text-sm">認証</button>
        </form>
        {emailMsg && <div className="text-xs text-green-600">{emailMsg}</div>}
        {emailErr && <div className="text-xs text-red-600">{emailErr}</div>}
        <div className="text-xs text-slate-500">登録時にバックエンドログに出力された token を使用してください。</div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-medium text-sm">電話番号認証</h2>
        <form onSubmit={onSendPhone} className="flex gap-2">
          <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="メールアドレス" value={phoneEmail} onChange={(e) => setPhoneEmail(e.target.value)} />
          <button className="border rounded px-3 py-1 text-sm">コード再送信</button>
        </form>
        <form onSubmit={onPhoneVerify} className="flex gap-2">
          <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="認証コード" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} />
          <button className="border rounded px-3 py-1 text-sm">電話認証</button>
        </form>
        {phoneMsg && <div className="text-xs text-green-600">{phoneMsg}</div>}
        {phoneErr && <div className="text-xs text-red-600">{phoneErr}</div>}
        <div className="text-xs text-slate-500">コードはサーバログに出力されます（暫定）。</div>
      </div>
    </div>
  );
}