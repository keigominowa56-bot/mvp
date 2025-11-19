// backend/src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../../entities/user.entity';
// import { JwtService } from '@nestjs/jwt'; // JwtServiceは存在すると仮定

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        // private readonly jwtService: JwtService,
    ) {}
    
    // loginDto.firebaseToken (string) を受け取り、ユーザー認証を行うメソッドを仮定
    async validateUserByFirebaseToken(token: string): Promise<User> {
        // 実際にはFirebase Admin SDKを使ってトークンを検証し、Userを返すロジック
        const user = await this.usersService.findByFirebaseUid('mock-firebase-uid'); 
        if (!user) {
            throw new UnauthorizedException('ユーザーが見つかりません');
        }
        return user;
    }

    // エラーTS2345の修正: loginDto.firebaseToken (string) を受け取り、それをUserに変換してペイロードを生成
    async login(token: string) {
        // トークンからUserを取得
        const user = await this.validateUserByFirebaseToken(token);
        
        // JWTペイロード生成（仮）
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            photoUrl: user.photoUrl, 
            district: user.district, 
        };
        // return { access_token: this.jwtService.sign(payload) };
        return { user: payload, access_token: 'mock-jwt-token' }; // 仮の戻り値
    }

    // エラーTS2339の修正: refreshTokenメソッドを追加
    async refreshToken(userId: string): Promise<any> {
        // 実際にはリフレッシュトークンロジックが入る
        return { access_token: `new_token_for_${userId}` };
    }
}