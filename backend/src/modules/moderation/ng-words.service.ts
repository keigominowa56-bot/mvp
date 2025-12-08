import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NgWord } from '../../entities/ng-word.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NgWordsService {
  constructor(
    @InjectRepository(NgWord)
    private readonly repo: Repository<NgWord>,
  ) {}

  // 一覧
  async list(): Promise<string[]> {
    const rows = await this.repo.find();
    return rows.map((r) => r.word.toLowerCase());
  }

  // 追加（重複は無視する）
  async add(word: string) {
    const w = word.trim().toLowerCase();
    if (!w) return;
    const existing = await this.repo.findOne({ where: { word: w } });
    if (existing) return existing;
    const row = this.repo.create({ word: w });
    return this.repo.save(row);
  }

  // 削除（ID指定）
  async remove(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) return { ok: true };
    await this.repo.remove(row);
    return { ok: true };
  }

  // 含有判定
  async containsNg(input: string): Promise<{ found: string[] }> {
    const words = await this.list();
    const lower = input.toLowerCase();
    const found = words.filter((w) => lower.includes(w));
    return { found };
  }
}