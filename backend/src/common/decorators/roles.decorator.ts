// backend/src/common/decorators/roles.decorator.ts (全体コード)

import { SetMetadata } from '@nestjs/common';
// 役割の Enum をインポートします
import { UserRole } from '../../modules/users/user.entity';

// ロールデコレータをエクスポート
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);