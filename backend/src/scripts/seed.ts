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
import { PostType } from '../enums/post-type.enum';
import { Follow } from '../entities/follow.entity';

async function main() {
  const ds: DataSource = await dataSource.initialize();

  const regionRepo = ds.getRepository(Region);
  const partyRepo = ds.getRepository(Party);
  const userRepo = ds.getRepository(User);
  const postRepo = ds.getRepository(Post);
  const followRepo = ds.getRepository(Follow);

  const region = await regionRepo.save(
    regionRepo.create({ name: '東京都 千代田区', prefectureCode: '13', cityCode: '101' }),
  );
  const party = await partyRepo.save(
    partyRepo.create({ name: '自由党', abbreviation: 'LP' }),
  );

  const pass = await bcrypt.hash('Passw0rd!', 10);

  // citizen1 (pending KYC)
  let citizen1 = await userRepo.findOne({ where: { email: 'citizen1@example.com' } });
  if (!citizen1) {
    citizen1 = await userRepo.save(
      userRepo.create({
        email: 'citizen1@example.com',
        phone: '09011111111',
        passwordHash: pass,
        name: '市民 太郎',
        nickname: 'citizen1',
        role: 'user',
        kycStatus: 'pending',
        ageGroup: 'twenties',
        regionId: region.id,
        supportedPartyId: party.id,
      }),
    );
  }

  // citizen2 (verified)
  let citizen2 = await userRepo.findOne({ where: { email: 'citizen2@example.com' } });
  if (!citizen2) {
    citizen2 = await userRepo.save(
      userRepo.create({
        email: 'citizen2@example.com',
        phone: '09022222222',
        passwordHash: pass,
        name: '市民 花子',
        nickname: 'citizen2',
        role: 'user',
        kycStatus: 'verified',
        ageGroup: 'thirties',
        regionId: region.id,
        supportedPartyId: party.id,
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
        role: 'politician',
        kycStatus: 'verified',
        ageGroup: 'forties',
        regionId: region.id,
        supportedPartyId: party.id,
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
        role: 'admin',
        kycStatus: 'verified',
        ageGroup: 'sixties_plus',
      }),
    );
  }

  // Initial post by politician
  await postRepo.save(
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
  await followRepo.save(followRepo.create({ followerUserId: citizen2.id, targetUserId: politician.id }));

  console.log('Seed completed.');
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});