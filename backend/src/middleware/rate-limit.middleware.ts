import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(_req: any, _res: any, next: Function) {
    // simplistic passthrough; replace with actual rate limit if needed
    next();
  }
}