export function getToken() {
  // JWT を cookie から取得する想定（必要なら cookie-parse などに変更）
  const m = document.cookie.match(/token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function setToken(token: string) {
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function clearToken() {
  document.cookie = 'token=; path=/; max-age=0';
}