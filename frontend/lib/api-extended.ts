// 修正前: import api, { unwrap } from './api'
// 修正後: 名前付き import に統一
import { apiFetchWithAuth, unwrap } from './api';

// 例: 追加のユーティリティが必要ならここで再エクスポートも可能
export async function verifyEmail(token: string) {
  return apiFetchWithAuth(`/auth/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function verifyPhone(code: string) {
  return apiFetchWithAuth(`/auth/verify-phone`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// unwrap が必要な場所で利用
export { unwrap };