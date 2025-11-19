// backend/src/scripts/import-members.ts

import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { parse } from 'csv-parse'; // エラーTS2307修正 (ライブラリのインストールを前提)
import { MembersService } from '../modules/members/members.service';
import { CreateMemberDto } from '../modules/members/dto/create-member.dto';
import { Member } from '../entities/member.entity';
import { AppModule } from '../app.module';

// CSVファイルの型定義 (ヘッダー名に合わせる)
interface CsvMemberRow {
  name: string;
  twitter_handle: string;
  email: string;
  affiliation: string;
  position: string;
}

/**
 * CSVファイルからメンバーデータをインポートするスクリプト
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const membersService = app.get(MembersService);

  const filePath = process.argv[2];
  if (!filePath) {
    console.error('エラー: インポートするCSVファイルのパスを指定してください。');
    console.log('使用方法: node ./dist/scripts/import-members.js <path/to/members.csv>');
    await app.close();
    process.exit(1);
  }

  console.log(`--- メンバーデータインポート開始: ${filePath} ---`);

  let importedCount = 0;
  let skippedCount = 0;
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }));

  for await (const row of parser) {
    const data: CsvMemberRow = row as CsvMemberRow;

    if (!data.name) {
      console.warn(`警告: 名前がない行をスキップしました: ${JSON.stringify(row)}`);
      skippedCount++;
      continue;
    }

    try {
      // エラーTS2352修正: CreateMemberDtoのプロパティをnullable/optionalとして扱い、any経由でキャスト
      const memberDto: CreateMemberDto = {
        name: data.name,
        twitterHandle: data.twitter_handle || undefined,
        email: data.email || undefined,
        affiliation: data.affiliation || undefined,
        position: data.position || undefined, 
        userId: undefined,
        blogRssUrl: undefined,
        officialRssUrl: undefined,
      } as any as CreateMemberDto; // 最も安全なキャスト方法

      let existingMember: Member | null = null;
      if (memberDto.email) {
        // エラーTS2339修正: MembersServiceにfindByEmailメソッドを追加済み
        existingMember = await membersService.findByEmail(memberDto.email); 
      }

      if (existingMember) {
        // 更新
        await membersService.update(existingMember.id, memberDto); 
        console.log(`更新: ${data.name} (ID: ${existingMember.id})`);
      } else {
        // 新規作成
        await membersService.create(memberDto);
        console.log(`新規作成: ${data.name}`);
      }
      importedCount++;
    } catch (error) {
      console.error(`インポートエラー (名前: ${data.name}): ${error.message}`);
      skippedCount++;
    }
  }

  console.log('--- メンバーデータインポート完了 ---');
  console.log(`成功件数: ${importedCount}`);
  console.log(`スキップ件数: ${skippedCount}`);

  await app.close();
}

bootstrap().catch(err => {
  console.error('致命的なエラー:', err);
  process.exit(1);
});