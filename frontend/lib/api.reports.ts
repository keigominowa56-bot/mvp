const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type Report = {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;        // open | resolved など
  adminAction: string | null; // hide | ignore 等
  createdAt: string;
};

export async function createReport(targetType: string, targetId: number, reason: string) {
  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, reason })
    });
    if (!res.ok) {
      let msg = 'Report failed';
      try {
        const detail = await res.json();
        if (detail?.message) msg = detail.message;
      } catch {}
      throw new Error(msg);
    }
    return res.json() as Promise<Report>;
  } catch (e: any) {
    throw new Error(e.message || 'Report error');
  }
}

// 管理者一覧
export async function fetchAdminReports(): Promise<Report[]> {
  try {
    const res = await fetch(`${API_BASE}/reports/admin`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch reports: ${res.status}`);
    }
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

// 管理者アクション (hide | ignore など)
export async function adminReportAction(id: number, action: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reports/admin/${id}/${action}`, {
      method: 'POST'
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}