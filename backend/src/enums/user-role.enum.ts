// 重複 export を排除（宣言は1回、末尾の列挙も1回のみ）

export type UserRole = 'user' | 'politician' | 'admin';

export enum UserRoleEnum {
  USER = 'user',
  POLITICIAN = 'politician',
  ADMIN = 'admin',
}

export const USER_ROLES = ['user', 'politician', 'admin'] as const;

export { UserRoleEnum, USER_ROLES }