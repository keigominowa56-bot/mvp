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

  // 環境変数から管理者メールアドレスを取得（デフォルトは system@news.local）
  const adminEmail = process.env.ADMIN_EMAIL || 'system@news.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const adminName = process.env.ADMIN_NAME || 'システム管理者';
  
  // 既存の管理者ユーザーをチェック
  const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    let systemUser = userRepo.create({
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: adminName,
      nickname: 'admin',
      displayName: adminName,
      role: 'admin',
      phoneNumber: null,
      ageGroup: null,
      status: 'approved', // 管理者は承認済みとして作成
      emailVerified: true, // 開発環境では認証済みとして作成
    } as any);
    systemUser = (await userRepo.save(systemUser))!;
    console.log(`✅ 管理者ユーザーを作成しました: ${adminEmail}`);
  } else {
    console.log(`ℹ️  管理者ユーザーは既に存在します: ${adminEmail}`);
  }
}