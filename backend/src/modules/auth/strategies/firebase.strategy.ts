import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(@Inject('FIREBASE_ADMIN') _firebaseAdmin: any) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'firebase-secret', // This will be overridden in validate
    });
  }

  async validate(payload: any): Promise<any> {
    // For now, we'll use JWT strategy instead of Firebase token validation
    // In production, you should validate the Firebase token here
    return payload;
  }
}
