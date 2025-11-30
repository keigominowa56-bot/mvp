import { ActivityLogType } from '../../../enums/activity-log-type.enum';

export class UpdateActivityLogDto {
  action?: string;
  actorId?: string;
  memberId?: string;
  externalId?: string;
  source?: ActivityLogType;
  url?: string;
  content?: string;
  title?: string;
  publishedAt?: Date;
  metadata?: string;
}