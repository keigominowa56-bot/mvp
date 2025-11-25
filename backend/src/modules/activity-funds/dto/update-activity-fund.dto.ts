// NOTE: PartialType を使わず手書きで optional にする
export class UpdateActivityFundDto {
  // 例: CreateActivityFundDto に title: string; amount: number; description?: string; があると仮定
  title?: string;
  amount?: number;
  description?: string;
  // 他に CreateActivityFundDto で定義しているフィールドがあればすべて ? を付けて追加
}