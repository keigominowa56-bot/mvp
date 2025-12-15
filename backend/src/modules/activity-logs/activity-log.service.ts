import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivityLogService {
  async log(_actorUserId: string | null, action: string, data: Record<string, any>) {
    // 未使用引数警告回避のため _actorUserId とする
    // TODO: 実ログ保存処理
    return { ok: true, action, data };
  }
}