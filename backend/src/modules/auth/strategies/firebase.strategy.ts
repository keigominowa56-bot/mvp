import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class FirebaseStrategy {
  constructor(@Inject('FIREBASE_ADMIN') private readonly _firebaseAdmin: any) {}

  async validateToken(_token: string): Promise<boolean> {
    // 参照して未使用エラーを解消
    void this._firebaseAdmin;
    return true;
  }
}