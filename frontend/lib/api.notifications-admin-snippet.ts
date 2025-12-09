// ===== 管理: 通知送信 =====
export async function adminSendNotification(input: {
  userId: string;
  type: string;
  title: string;
  text?: string;
  linkUrl?: string;
}) {
  const res = await api.post('/notifications/send', input);
  return unwrap(res);
}

export async function adminBulkSendNotifications(input: {
  userIds: string[];
  type: string;
  title: string;
  text?: string;
  linkUrl?: string;
}) {
  const res = await api.post('/notifications/bulk', input);
  return unwrap(res);
}