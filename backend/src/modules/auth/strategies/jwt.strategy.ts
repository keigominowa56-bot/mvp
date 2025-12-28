import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
    if (!isProd) {
      // 開発時のみ詳細ログ
      console.log('[JwtStrategy] initialized');
    }
  }

  async validate(payload: { sub: string; role: string; email?: string }) {
    if (!isProd) {
      console.log('[JwtStrategy] validate payload:', payload);
    }
    return { sub: payload.sub, role: payload.role, email: payload.email };
  }
}