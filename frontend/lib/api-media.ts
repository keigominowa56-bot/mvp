export async function uploadMedia(file: File, token: string, category: 'post' | 'comment' | 'kyc' = 'comment') {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  // APIベースURL（固定値、末尾のスラッシュなし、/apiは含めない）
  const apiBase = 'https://api.polimee.com';
  const res = await fetch(`${apiBase}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json() as Promise<{ mediaId: string; url: string; type: string }>;
}