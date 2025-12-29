export async function uploadMedia(file: File, token: string, category: 'post' | 'comment' | 'kyc' = 'comment') {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://153.126.130.7:10000';
  const res = await fetch(`${apiBase}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json() as Promise<{ mediaId: string; url: string; type: string }>;
}