export type KycStatus = 'pending' | 'verified' | 'rejected';

export const KYC_STATUSES = ['pending', 'verified', 'rejected'] as const;

export function isKycStatus(val: any): val is KycStatus {
  return (KYC_STATUSES as readonly string[]).includes(val);
}