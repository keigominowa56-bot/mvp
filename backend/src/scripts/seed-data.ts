// backend/src/scripts/seed-data.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { MembersService } from '../modules/members/members.service';
import { ActivityLogsService } from '../modules/activity-logs/activity-logs.service';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { CreateMemberDto } from '../modules/members/dto/create-member.dto';
import { CreateActivityLogDto } from '../modules/activity-logs/dto/create-activity-log.dto';
import { ActivityLogType } from '../enums/activity-log-type.enum.js';
import { Member } from '../entities/member.entity';
import { ActivityLog } from '../entities/activity-log.entity.js'; // 修正: .js拡張子を追加

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const membersService = app.get(MembersService);
  const activityLogsService = app.get(ActivityLogsService);

  console.log('--- シードデータ投入開始 ---');

  // ===================================
  // 1. ユーザーデータ作成
  // ===================================

  const adminUserDto: CreateUserDto = {
    email: 'admin@example.com',
    role: 'admin',
    firebaseUid: 'firebase-admin-uid-1',
    displayName: 'Admin User',
  } as any; 
  
  const regularUserDto: CreateUserDto = {
    email: 'user@example.com',
    role: 'user', 
    firebaseUid: 'firebase-user-uid-2',
    displayName: 'Regular User',
  } as any; 

  // パスワードは仮の値です。実際の環境に合わせて変更してください。
  const adminUser = await usersService.create({ 
    ...adminUserDto, 
    password: 'password', 
    firstName: 'Admin',
    lastName: 'User',
  } as any);

  const regularUser = await usersService.create({ 
    ...regularUserDto, 
    password: 'password', 
    firstName: 'Regular',
    lastName: 'User',
  } as any);


  console.log(`管理者ユーザー作成: ${adminUser.email}`);
  console.log(`一般ユーザー作成: ${regularUser.email}`);

  // ===================================
  // 2. メンバーデータ作成
  // ===================================
  
  const membersData: CreateMemberDto[] = [
    {
      name: 'Minowakeigo',
      twitterHandle: 'minowakeigo',
      userId: adminUser.id, 
      email: 'minowa@example.com', 
      affiliation: 'Leader', 
    } as any, 
    {
      name: 'Supporter A',
      twitterHandle: 'supporter_a',
      userId: regularUser.id, 
      email: 'supporter@example.com', 
      affiliation: 'Supporter', 
    } as any, 
    {
      name: 'Guest B',
      twitterHandle: 'guest_b',
      email: 'guest@example.com', 
      affiliation: 'Guest', 
    },
  ];

  const createdMembers: Member[] = [];
  for (const data of membersData) {
    const member = await membersService.create(data);
    createdMembers.push(member);
    console.log(`メンバー作成: ${member.name}`);
  }

  // ===================================
  // 3. 活動ログデータ作成
  //===================================
  const [member, ,] = createdMembers;

  for (let i = 0; i < 3; i++) {
    const logData: CreateActivityLogDto = {
      memberId: member.id,
      source: ActivityLogType.MANUAL, // 修正: typeではなくsourceを使用
      externalId: `seed-${member.id}-${i}`,
      url: 'http://example.com/manual-log',
      title: `手動ログタイトル ${i + 1}`,
      content: `これは ${member.name} のためのテストログ (${i + 1}) です。`,
      publishedAt: new Date(Date.now() - i * 86400000),
    };
    const log = await activityLogsService.create(logData);
    console.log(`活動ログ作成: ${log.title}`);
  }

  console.log('--- シードデータ投入完了 ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error('シードデータ投入エラー:', err);
  process.exit(1);
});