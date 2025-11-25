export class CreatePledgeDto {
  memberId: string;
  amount: number;
  description?: string;
  status?: string;
}