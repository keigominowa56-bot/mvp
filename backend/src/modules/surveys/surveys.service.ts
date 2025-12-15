import { Injectable } from '@nestjs/common';

@Injectable()
export class SurveysService {
  async availableForUser(userId: string) {
    // 実装が未定の場合の暫定レスポンス
    return { ok: true, userId, surveys: [] };
  }

  async submitResponse(surveyId: string, userId: string, dto: { answers: Record<string, any> }) {
    // 実装が未定の場合の暫定レスポンス
    return { ok: true, surveyId, userId, answers: dto.answers };
  }
}