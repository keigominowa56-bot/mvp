import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Member } from 'src/entities/member.entity';

@Injectable()
export class MembersService {
  constructor(@InjectRepository(Member) private readonly repo: Repository<Member>) {}

  async create(dto: {
    userId: string;
    name: string;
    email?: string | null;
    twitterHandle?: string | null;
  }) {
    const m = this.repo.create({
      userId: dto.userId,
      name: dto.name,
      email: dto.email ?? null,
      twitterHandle: dto.twitterHandle ?? null,
      lastTwitterFetch: null,
      role: null,
      groupId: null,
    } as any);
    return this.repo.save(m);
  }

  async update(id: string, dto: { name?: string; email?: string | null; twitterHandle?: string | null }) {
    const member = await this.repo.findOne({ where: { id } as FindOptionsWhere<Member> });
    if (!member) throw new NotFoundException('Member not found');

    if (dto.name) member.name = dto.name;
    if (dto.email !== undefined) member.email = dto.email;
    if (dto.twitterHandle !== undefined) member.twitterHandle = dto.twitterHandle;

    // Twitter情報更新のタイムスタンプを更新する例
    member.lastTwitterFetch = new Date();

    return this.repo.save(member);
  }
}