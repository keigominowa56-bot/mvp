export enum UserRoleEnum {
  CITIZEN = 'citizen',
  POLITICIAN = 'politician',
  ADMIN = 'admin',
}

export const USER_ROLES = [UserRoleEnum.CITIZEN, UserRoleEnum.POLITICIAN, UserRoleEnum.ADMIN] as const;

// 型エイリアス（配列から導出）
export type UserRole = (typeof USER_ROLES)[number];