import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { NgWord } from '../../entities/ng-word.entity';

@Injectable()
export class NgWordsService {
  constructor(@InjectRepository(NgWord) private readonly repo: Repository<NgWord>) {}

  async list(): Promise<NgWord[]> {
    return this.repo.find({ order: { word: 'ASC' } });
  }

  async add(word: string) {
    word = (word || '').trim();
    if (!word) throw new BadRequestException('word required');
    const exist = await this.repo.findOne({ where: { word } });
    if (exist) return exist;
    const nw = this.repo.create({ word });
    return this.repo.save(nw);
  }

  async remove(id: string) {
    const w = await this.repo.findOne({ where: { id } });
    if (!w) throw new BadRequestException('not found');
    await this.repo.remove(w);
    return { deleted: true };
  }

  async containsNg(text: string): Promise<string | null> {
    if (!text) return null;
    const words = await this.list();
    const lower = text.toLowerCase();
    for (const w of words) {
      const pattern = w.word.toLowerCase();
      if (pattern && lower.includes(pattern)) return w.word;
    }
    return null;
  }
}