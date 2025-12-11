/* 
  Seed script: 代表データの投入
  使い方:
    - npm i -D ts-node typescript
    - npx ts-node backend/src/scripts/seed.ts
*/
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

import { DataSource } from 'typeorm';
import dataSource from './typeorm.config';
import * as bcrypt from 'bcryptjs';

import { Region } from '../entities/region.entity';
import { Party } from '../entities/party.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { PoliticianProfile, FundingSpendingItem } from '../entities/politician-profile.entity';
import { Survey } from '../entities/survey.entity';
import { SurveyResponse } from '../entities/survey-response.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { Follow } from '../entities/follow.entity';
import { Notification } from '../entities/notification.entity';
import { Vote } from '../entities/vote.entity';
import { Comment } from '../entities/comment.entity';

import { UserRole } from '../enums/user-role.enum';
import { KycStatus } from '../enums/kyc-status.enum';
import { AgeGroup } from '../enums/age-group.enum';
import { PostType } from '../enums/post-type.enum';
import { WalletTransactionType } from '../enums/wallet-transaction-type.enum';
import { Currency } from '../enums/currency.enum';

async function main() {
  const ds: DataSource = await dataSource.initialize();

  // Region / Party
  const regionRepo = ds.getRepository(Region);
  const partyRepo = ds.getRepository(Party);

  const region = await regionRepo.save(
    regionRepo.create({ name: '東京都 千代田区', prefectureCode: '13', cityCode: '101' }),
  );
  const party = await partyRepo.save(
    partyRepo.create({ name: '自由党', abbreviation: 'LP' }),
  );

  // Users
  const userRepo = ds.getRepository(User);
  const pass = await bcrypt.hash('Passw0rd!', 10);

  // citizen1 (KYC none)
  let citizen1 = await userRepo.findOne({ where: { email: 'citizen1@example.com' } });
  if (!citizen1) {
    citizen1 = await userRepo.save(
      userRepo.create({
        email: 'citizen1@example.com',
        phone: '09011111111',
        passwordHash: pass,
        name: '市民 太郎',
        nickname: 'citizen1',
        ageGroup: AgeGroup.TWENTIES,
        region,
        supportedParty: party,
        role: UserRole.CITIZEN,
        kycStatus: KycStatus.NONE,
      }),
    );
  }

  // citizen2 (KYC verified)
  let citizen2 = await userRepo.findOne({ where: { email: 'citizen2@example.com' } });
  if (!citizen2) {
    citizen2 = await userRepo.save(
      userRepo.create({
        email: 'citizen2@example.com',
        phone: '09022222222',
        passwordHash: pass,
        name: '市民 花子',
        nickname: 'citizen2',
        ageGroup: AgeGroup.THIRTIES,
        region,
        supportedParty: party,
        role: UserRole.CITIZEN,
        kycStatus: KycStatus.VERIFIED,
      }),
    );
  }

  // politician
  let politician = await userRepo.findOne({ where: { email: 'politician@example.com' } });
  if (!politician) {
    politician = await userRepo.save(
      userRepo.create({
        email: 'politician@example.com',
        phone: '09033333333',
        passwordHash: pass,
        name: '議員 次郎',
        nickname: 'politician',
        ageGroup: AgeGroup.FORTIES,
        region,
        supportedParty: party,
        role: UserRole.POLITICIAN,
        kycStatus: KycStatus.VERIFIED,
      }),
    );
  }

  // system user for news
  let systemUser = await userRepo.findOne({ where: { email: 'system@news.local' } });
  if (!systemUser) {
    systemUser = await userRepo.save(
      userRepo.create({
        email: 'system@news.local',
        phone: '00000000000',
        passwordHash: pass,
        name: 'News System',
        nickname: 'system',
        ageGroup: AgeGroup.SIXTIES_PLUS,
        role: UserRole.ADMIN,
        kycStatus: KycStatus.VERIFIED,
      }),
    );
  }

  // PoliticianProfile
  const profRepo = ds.getRepository(PoliticianProfile);
  let profile = await profRepo.findOne({ where: { userId: politician.id } });
  if (!profile) {
    profile = await profRepo.save(
      profRepo.create({
        userId: politician.id,
        bio: '地域密着の政策を推進中です。',
        partyId: party.id,
        age: 45,
        pledges: [{ title: '教育支援の拡充' }, { title: '地域交通の改善' }],
        fundingReportUrl: null,
      }),
    );
  }

  // Initial post by politician
  const postRepo = ds.getRepository(Post);
  let post = await postRepo.save(
    postRepo.create({
      authorUserId: politician.id,
      type: PostType.ACTIVITY,
      title: '街頭演説を行いました',
      content: '本日は駅前で教育政策について演説しました。',
      mediaIds: null,
      regionId: region.id,
    }),
  );

  // Follow (citizen2 -> politician)
  const followRepo = ds.getRepository(Follow);
  await followRepo.save(followRepo.create({ followerUserId: citizen2.id, targetUserId: politician.id }));

  // Survey
  const surveyRepo = ds.getRepository(Survey);
  const survey = await surveyRepo.save(
    surveyRepo.create({
      title: '教育政策アンケート',
      description: '地域の教育支援に関するアンケート',
      questions: [
        { id: 'q1', type: 'single', text: '教育支援に賛成ですか？', options: ['はい', 'いいえ'] },
      ],
      targetCriteria: { regionIds: [region.id] },
      startAt: new Date(Date.now() - 3600_000),
      endAt: null,
    }),
  );

  console.log('Seed completed');
  console.log('Users:');
  console.log(' citizen1@example.com / Passw0rd! (KYC none)');
  console.log(' citizen2@example.com / Passw0rd! (KYC verified)');
  console.log(' politician@example.com / Passw0rd! (POLITICIAN)');
  console.log('System news user:', systemUser.email);

  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});