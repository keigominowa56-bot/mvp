#!/usr/bin/env ts-node
/**
 * 初期管理者ユーザーを作成するスクリプト
 * 
 * 使用方法:
 *   ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=yourpassword npm run create-admin
 *   または
 *   ts-node scripts/create-admin.ts your-email@example.com yourpassword
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../src/entities/user.entity';
import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';

async function createAdmin() {
  // コマンドライン引数からメールアドレスとパスワードを取得
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'password123';
  const name = process.argv[4] || process.env.ADMIN_NAME || '管理者';

  if (!email) {
    console.error('❌ エラー: メールアドレスが指定されていません');
    console.log('');
    console.log('使用方法:');
    console.log('  ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=yourpassword npm run create-admin');
    console.log('  または');
    console.log('  ts-node scripts/create-admin.ts your-email@example.com yourpassword [name]');
    process.exit(1);
  }

  // NestJSアプリケーションを作成してDataSourceを取得
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  try {
    const userRepo = dataSource.getRepository(User);

    // 既存のユーザーをチェック
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      console.log(`ℹ️  ユーザーは既に存在します: ${email}`);
      console.log(`   ロール: ${existing.role}`);
      console.log(`   ステータス: ${existing.status}`);
      
      // 既存ユーザーを管理者に更新するか確認
      if (existing.role !== 'admin') {
        console.log(`⚠️  既存ユーザーは管理者ではありません。管理者に更新しますか？ (y/N)`);
        // ここでは自動的に更新しない（手動で実行する場合はコメントアウトを外す）
        // existing.role = 'admin';
        // existing.status = 'approved';
        // existing.emailVerified = true;
        // await userRepo.save(existing);
        // console.log(`✅ ユーザーを管理者に更新しました`);
      }
      await app.close();
      process.exit(0);
    }

    // 新しい管理者ユーザーを作成
    const passwordHash = await bcrypt.hash(password, 10);
    const adminUser = userRepo.create({
      email,
      passwordHash,
      name,
      nickname: email.split('@')[0],
      role: 'admin',
      status: 'approved',
      emailVerified: true,
      phoneVerified: false,
    } as any);

    const saved = await userRepo.save(adminUser);
    console.log(`✅ 管理者ユーザーを作成しました:`);
    console.log(`   メールアドレス: ${email}`);
    console.log(`   名前: ${name}`);
    console.log(`   ユーザーID: ${saved.id}`);
    console.log(`   ロール: admin`);
    console.log(`   ステータス: approved`);
    console.log('');
    console.log(`🔐 パスワード: ${password}`);
    console.log('');
    console.log(`📝 この情報を安全に保管してください。`);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await app.close();
    process.exit(1);
  }
}

createAdmin();

