// Resolve duplicate exports (TS2484) and provide both type and value references.

export type UserRole = 'user' | 'politician' | 'admin';

export enum UserRoleEnum {
  USER = 'user',
  POLITICIAN = 'politician',
  ADMIN = 'admin',
}

export const USER_ROLES = ['user', 'politician', 'admin'] as const;

export function isUserRole(val: any): val is UserRole {
  return (USER_ROLES as readonly string[]).includes(val);
}

// Single, explicit export list to avoid duplicate export declarations
export { UserRoleEnum, USER_ROLES }