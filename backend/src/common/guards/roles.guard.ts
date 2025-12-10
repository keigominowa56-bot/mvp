// backend/src/common/guards/roles.guard.ts (全体コード)

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector を使用して、デコレータで設定されたメタデータ（必要なロール）を読み取ります
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. メソッドやクラスに設定された 'roles' メタデータを取得
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(), // メソッド（例: createPost）
      context.getClass(),   // クラス（例: PostsController）
    ]);
    
    // 2. ロール設定がない場合は、アクセスを許可
    if (!requiredRoles) {
      return true;
    }

    // 3. リクエストから認証済みユーザー情報を取得
    const request = context.switchToHttp().getRequest();
    // ⚠️ 前提: JWT Guard などで認証後、ユーザー情報が req.user に付与されている必要があります。
    const user = request.user; 

    // 4. ユーザー情報がない、またはロールがない場合はアクセスを拒否
    if (!user || !user.role) {
      return false;
    }

    // 5. ユーザーのロールが必要なロールリストに含まれているかチェック
    // 政治家('politician')または管理者('admin')のどちらかであれば true を返す
    return requiredRoles.some((role) => user.role === role);
  }
}