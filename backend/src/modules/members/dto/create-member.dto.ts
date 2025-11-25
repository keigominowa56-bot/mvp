export class CreateMemberDto {
  // 以前 @ApiProperty() 付きなら削除
  name: string;
  email: string;
  // 必要なフィールドをそのまま残す
}