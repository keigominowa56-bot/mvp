import { DataSource } from 'typeorm';
import { NgWord } from '../src/entities/ng-word.entity';
import 'dotenv/config';

async function run() {
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DB_FILE || 'dev.sqlite',
    entities: [NgWord],
    synchronize: false,
  });
  await ds.initialize();
  const repo = ds.getRepository(NgWord);
  const list = ['死ね', '殺す', '詐欺', '違法']; // 例
  for (const w of list) {
    const exist = await repo.findOne({ where: { word: w } });
    if (!exist) {
      await repo.save(repo.create({ word: w }));
      console.log('Added NG word:', w);
    }
  }
  await ds.destroy();
}
run().catch(e => { console.error(e); process.exit(1); });