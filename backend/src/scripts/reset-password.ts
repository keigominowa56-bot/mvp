import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { INestApplicationContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

async function bootstrap() {
  const email = process.argv[2];
  const newPass = process.argv[3];

  if (!email || !newPass) {
    console.error('Usage: ts-node src/scripts/reset-password.ts <email> <newPassword>');
    process.exit(1);
  }

  const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPass, salt);

    // プロジェクトのユーザーエンティティに合わせて両対応
    if ('passwordHash' in user) {
      (user as any).passwordHash = hash;
    } else {
      (user as any).password = hash;
    }

    await userRepo.save(user);
    console.log(`Password updated for ${email}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();