import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ScheduledPost } from 'src/entities/scheduled-post.entity';
import { Post } from 'src/entities/post.entity';
import { NgWordsService } from 'src/modules/moderation/ng-words.service';

function toDate(d: string | Date): Date {
  if (d instanceof Date) return d;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) throw new Error('invalid date');
  return parsed;
}

@Injectable()
export class ScheduledPostsService {
  private readonly logger = new Logger(ScheduledPostsService.name);

  constructor(
    @InjectRepository(ScheduledPost) private readonly repo: Repository<ScheduledPost>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    private readonly ngWords: NgWordsService,
  ) {}

  async schedule(authorId: string, body: { scheduledAt: string | Date; title: string; body: string; tags?: string[] }) {
    const sp = this.repo.create({
      authorId,
      scheduledAt: toDate(body.scheduledAt),
      title: body.title,
      body: body.body,
      tags: body.tags ?? null,
      status: 'pending',
      postedPostId: null,
      failureReason: null,
    } as any);
    return this.repo.save(sp);
  }

  async list() {
    return this.repo.find({
      order: { scheduledAt: 'ASC' },
      take: 200,
    });
  }

  async cancel(id: string, authorId: string) {
    const sp = await this.repo.findOne({ where: { id } });
    if (!sp) throw new NotFoundException('scheduled post not found');
    if (sp.authorId !== authorId) throw new ForbiddenException('not owner');
    if (sp.status !== 'pending') throw new ForbiddenException('can cancel only pending');
    sp.status = 'canceled';
    await this.repo.save(sp);
    return { ok: true };
  }

  async runDuePosts(now = new Date()) {
    const due = await this.repo.find({
      where: { scheduledAt: LessThanOrEqual(now), status: 'pending' } as any,
      order: { scheduledAt: 'ASC' },
      take: 100,
    });

    for (const sp of due) {
      try {
        const ng = await this.ngWords.containsNg(sp.body);
        if (ng) {
          sp.status = 'rejected';
          sp.failureReason = 'Contains NG words';
          await this.repo.save(sp);
          continue;
        }

        const postEntity = this.posts.create({
          authorUserId: sp.authorId,
          type: 'normal',
          title: sp.title,
          content: sp.body,
          mediaIds: null,
          regionId: null,
        } as any);
        const saved = await this.posts.save(postEntity);

        sp.postedPostId = (saved as any).id;
        sp.status = 'posted';
        sp.failureReason = null;
        await this.repo.save(sp);
      } catch (e: any) {
        sp.status = 'error';
        sp.failureReason = e?.message ?? 'unknown error';
        await this.repo.save(sp);
        this.logger.error(`Failed to post scheduled ${sp.id}: ${sp.failureReason}`);
      }
    }

    return { ok: true, processed: due.length };
  }
}