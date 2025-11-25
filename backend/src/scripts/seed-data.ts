// 例: ActivityLog 追加部分だけ抜粋
await activityLogsService.create({
  action: 'seed_create',
  actorId: member.id,
  memberId: member.id,
  externalId: undefined,
  metadata: 'Initial seed log',
});