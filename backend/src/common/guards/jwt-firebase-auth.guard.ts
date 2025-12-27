import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class JwtFirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader) throw new UnauthorizedException('No authorization header');

    const token = authHeader.replace(/^Bearer\s+/i, '');
    try {
      // Firebase admin認証: firebase.config.tsでinitialize済み想定
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}