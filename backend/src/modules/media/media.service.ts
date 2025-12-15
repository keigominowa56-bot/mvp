import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from 'src/entities/media.entity';

export type CreateMediaParams = {
  ownerUserId?: string | null;
  category?: string | null;
  type: string;
  path: string;
  originalName?: string | null;
  sizeBytes?: number | null;
  mimeType?: string | null;
  meta?: Record<string, any> | null;
};

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private readonly repo: Repository<Media>) {}

  async create(params: CreateMediaParams) {
    const record = this.repo.create({
      ownerUserId: params.ownerUserId ?? null,
      category: params.category ?? null,
      type: params.type,
      path: params.path,
      originalName: params.originalName ?? null,
      sizeBytes: params.sizeBytes ?? null,
      mimeType: params.mimeType ?? null,
      meta: params.meta ?? null,
    } as any);
    return this.repo.save(record);
  }

  async listByOwner(ownerUserId: string, limit = 100) {
    return this.repo.find({
      where: { ownerUserId },
      order: { createdAt: 'DESC' },
      take: Math.max(1, Math.min(limit, 200)),
    });
  }

  async get(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async updateMeta(id: string, meta: Record<string, any>) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) return null;
    m.meta = meta;
    return this.repo.save(m);
  }

  async delete(id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}