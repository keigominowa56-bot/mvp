import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';

interface Bucket {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private buckets = new Map<string, Bucket>();

  use(req: any, _res: any, next: () => void) {
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
    const max = Number(process.env.RATE_LIMIT_MAX || 120);
    const key = req.ip || 'unknown';
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.expiresAt < now) {
      this.buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count++;
    return next();
  }
}