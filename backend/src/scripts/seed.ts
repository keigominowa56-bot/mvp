import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';

export async function runSeed(ds: DataSource) {
  const userRepo = ds.getRepository(User);

  let citizen1 = userRepo.create({
    email: 'citizen1@example.com',
    passwordHash: await bcrypt.hash('password123', 10),
    name: '佐藤一郎',
    nickname: 'citizen1',
    displayName: '市民1',
    role: 'citizen',
    phoneNumber: '09011112222',
    ageGroup: '30s',
    status: 'active',
  } as any);
  citizen1 = (await userRepo.save(citizen1))!;

  let citizen2 = userRepo.create({
    email: 'citizen2@example.com',
    passwordHash: await bcrypt.hash('password123', 10),
    name: '鈴木次郎',
    nickname: 'citizen2',
    displayName: '市民2',
    role: 'citizen',
    phoneNumber: '09033334444',
    ageGroup: '20s',
    status: 'active',
  } as any);
  citizen2 = (await userRepo.save(citizen2))!;

  let politician = userRepo.create({
    email: 'politician@example.com',
    passwordHash: await bcrypt.hash('password123', 10),
    name: '田中太郎',
    nickname: 'politan',
    displayName: '政治家',
    role: 'politician',
    phoneNumber: '09055556666',
    ageGroup: '40s',
    status: 'active',
  } as any);
  politician = (await userRepo.save(politician))!;

  let systemUser = userRepo.create({
    email: 'system@news.local',
    passwordHash: await bcrypt.hash('password123', 10),
    name: 'システム',
    nickname: 'system',
    displayName: 'システム',
    role: 'admin',
    phoneNumber: null,
    ageGroup: null,
    status: 'active',
  } as any);
  systemUser = (await userRepo.save(systemUser))!;
}