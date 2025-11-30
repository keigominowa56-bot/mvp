import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ScheduledPost } from '../../entities/scheduled-post.entity';
import { Post } from '../posts/post.entity';
import { User } from '../../entities/user.entity';
import { NgWordsService } from '../moderation/ng-words.service';

@Injectable()
export class ScheduledPostsService {
  constructor(
    @InjectRepository(ScheduledPost) private readonly spRepo: Repository<ScheduledPost>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly ngWords: NgWordsService,
  ) {
    // Simple worker loop
    setInterval(() => this.processDue().catch(console.error), 30000); // every 30s
  }

  async schedule(actorId: string, data: { authorId?: string; title?: string; body: string; tags?: string[]; scheduledAt: string }) {
    const actor = await this.userRepo.findOne({ where: { id: actorId } });
    if (!actor || actor.role !== 'admin') throw new BadRequestException('admin only');
    if (!data.body || !data.scheduledAt) throw new BadRequestException('body & scheduledAt required');
    const ng = await this.ngWords.containsNg(data.body);
    if (ng) throw new BadRequestException(`NG word detected: ${ng}`);

    const authorId = data.authorId || actorId;
    const scheduledAt = new Date(data.scheduledAt);
    if (isNaN(scheduledAt.getTime())) throw new BadRequestException('invalid scheduledAt');

    const sp = this.spRepo.create({
      authorId,
      title: data.title,
      body: data.body,
      tags: data.tags,
      scheduledAt,
      status: 'scheduled',
    });
    return this.spRepo.save(sp);
  }

  async list() {
    return this.spRepo.find({ order: { scheduledAt: 'ASC' }, take: 200 });
  }

  async cancel(id: string, actorId: string) {
    const actor = await this.userRepo.findOne({ where: { id: actorId } });
    if (!actor || actor.role !== 'admin') throw new BadRequestException('admin only');
    const sp = await this.spRepo.findOne({ where: { id } });
    if (!sp) throw new BadRequestException('not found');
    if (sp.status !== 'scheduled') throw new BadRequestException('cannot cancel');
    sp.status = 'canceled';
    return this.spRepo.save(sp);
  }

  async processDue() {
    const now = new Date();
    const due = await this.spRepo.find({
      where: { status: 'scheduled', scheduledAt: LessThanOrEqual(now) },
      take: 10,
      order: { scheduledAt: 'ASC' },
    });
    for (const sp of due) {
      try {
        const ng = await this.ngWords.containsNg(sp.body);
        if (ng) throw new Error('NG word at post time: ' + ng);
        const p = this.postRepo.create({
          authorId: sp.authorId,
          body: sp.body,
          title: sp.title,
          tags: sp.tags as any,
        } as Partial<Post>);
        const saved = await this.postRepo.save(p);
        sp.postedPostId = saved.id;
        sp.status = 'posted';
        await this.spRepo.save(sp);
      } catch (e: any) {
        sp.status = 'failed';
        sp.failureReason = e.message;
        await this.spRepo.save(sp);
      }
    }
  }
}