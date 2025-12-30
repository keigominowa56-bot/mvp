import { api } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  linkUrl?: string;
  readAt?: string | null;
  createdAt: string;
}

export async function listNotifications(): Promise<Notification[]> {
  const res = await api.get('/notifications');
  return res.data as Notification[];
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await api.patch(`/notifications/${id}/read`, {});
  return res.data as Notification;
}

export async function sendNotification(payload: { userId: string; type: string; title: string; text?: string; linkUrl?: string; email?: string }) {
  const res = await api.post('/notifications/send', payload);
  return res.data;
}

// 互換用: fetchNotifications を使っているページがある可能性に備え、listNotifications のエイリアスを提供します
export async function fetchNotifications(): Promise<Notification[]> {
  return listNotifications();
}