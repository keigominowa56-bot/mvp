export class CreateActivityLogDto {
  action: string;
  actorId: string;
  memberId?: string;
  externalId?: string;
  metadata?: string;
}