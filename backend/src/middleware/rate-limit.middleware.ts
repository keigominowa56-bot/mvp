import { Request, Response, NextFunction } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

// 依存なしの簡易レートリミッタ
class SimpleRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();
  constructor(private points: number, private durationSec: number) {}
  consume(key: string) {
    const now = Date.now();
    const bucket = this.store.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + this.durationSec * 1000 });
      return;
    }
    bucket.count += 1;
    if (bucket.count > this.points) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}

// インスタンス（状態保持）
const loginLimiter = new SimpleRateLimiter(5, 60);   // 1分に5回
const postLimiter  = new SimpleRateLimiter(30, 60);  // 1分に30回
const voteLimiter  = new SimpleRateLimiter(60, 60);  // 1分に60回

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const path = req.path || '';
    const ip = req.ip || (req.headers['x-forwarded-for']?.toString() || 'ip-unknown');

    if (path.startsWith('/auth/login')) {
      loginLimiter.consume(`login:${ip}`);
    } else if (path.startsWith('/feed') && req.method === 'POST') {
      // 投稿（/feed に POST）
      postLimiter.consume(`post:${ip}`);
    } else if (path.startsWith('/votes') && (req.method === 'POST' || req.method === 'PATCH')) {
      voteLimiter.consume(`vote:${ip}`);
    }

    next();
  } catch (e) {
    next(e);
  }
}