// 既に問題が出ていないが、同じパターンに揃えたいなら
export class UpdateUserDto {
  name?: string;
  email?: string;
  // 他のフィールド (role 等) があれば optional で追加
  role?: string;
}