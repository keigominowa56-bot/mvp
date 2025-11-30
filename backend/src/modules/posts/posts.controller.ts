import { Controller, Get, Post as HttpPost, Patch, Body, Param, Query, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Follow } from '../follows/follow.entity';
import { User } from '../../entities/user.entity';
import { PostsService } from './posts.service';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async feed(
    @Request() req: any,
    @Query('mode') mode?: 'followed_first',
    @Query('pref') pref?: string,
    @Query('city') city?: string,
    @Query('limit') limitQ?: string,
  ) {
    const userId = req.user.sub;
    const limit = Math.min(200, Math.max(1, Number(limitQ) || 50));

    const operator = await this.userRepo.findOne({ where: { email: 'operator@example.com' } });
    const operatorId = operator?.id;

    let posts = await this.postRepo.find({
      where: { hidden: false },
      order: { createdAt: 'DESC' },
      take: limit * 3,
    });

    if (pref) {
      posts = posts.filter(p => p.regionPref === pref);
      if (city) posts = posts.filter(p => p.regionCity === city);
    }

    if (mode === 'followed_first') {
      const follows = await this.followRepo.find({ where: { followerId: userId } });
      const followedIds = new Set(follows.map(f => f.politicianId));
      posts.sort((a, b) => {
        const af = followedIds.has(a.authorId || '');
        const bf = followedIds.has(b.authorId || '');
        if (af !== bf) return af ? -1 : 1;
        if (operatorId && (a.authorId === operatorId || b.authorId === operatorId) && a.authorId !== b.authorId) {
          return a.authorId === operatorId ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (operatorId) {
      posts.sort((a, b) => {
        const aOp = a.authorId === operatorId;
        const bOp = b.authorId === operatorId;
        if (aOp !== bOp) return aOp ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return posts.slice(0, limit);
  }

  // フィード投稿（制限：politician本人 or admin）
  @HttpPost()
  async create(
    @Body() body: { authorId?: string; title?: string; body: string; tags?: string[]; regionPref?: string; regionCity?: string },
    @Request() req: any,
  ) {
    const actorId = req.user.sub;
    const actor = await this.userRepo.findOne({ where: { id: actorId } });
    if (!actor) throw new ForbiddenException('no actor');

    const authorId = body.authorId || actorId;
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new BadRequestException('author not found');

    // 制約: admin は誰の名義でも投稿可、politician は自分名義のみ投稿可、user は不可
    if (actor.role === 'admin') {
      // ok
    } else if (actor.role === 'politician') {
      if (actorId !== authorId) throw new ForbiddenException('politicians can only post as themselves');
    } else {
      throw new ForbiddenException('only politicians or admins can post');
    }

    return this.postsService.create(
      {
        authorId,
        title: body.title,
        body: body.body,
        tags: body.tags,
        regionPref: body.regionPref,
        regionCity: body.regionCity,
      },
      actorId,
    );
  }

  // 投稿更新（制限：投稿者本人 or admin）
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() patch: { title?: string; body?: string; tags?: string[]; regionPref?: string; regionCity?: string; hidden?: boolean },
    @Request() req: any,
  ) {
    const actorId = req.user.sub;
    return this.postsService.update(id, patch, actorId);
  }
}