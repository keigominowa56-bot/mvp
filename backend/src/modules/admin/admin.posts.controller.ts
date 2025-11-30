import { Body, Controller, Post as HttpPost, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { Post as PostEntity } from '../posts/post.entity';
import * as bcrypt from 'bcrypt';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard)
export class AdminPostsController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
  ) {}

  private assertAdmin(req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admins only');
  }

  // 運営（システム）用の政治家ユーザーを確保
  private async ensureOperatorPolitician() {
    const email = 'operator@example.com';
    let u = await this.userRepo.findOne({ where: { email } });
    if (!u) {
      const passwordHash = await bcrypt.hash('operator-temp-pass', 10);
      u = this.userRepo.create({
        email,
        passwordHash,
        role: 'politician',
        name: '運営',
        party: '運営事務局',
        kycStatus: 'verified',
        planTier: 'pro',
      });
      u = await this.userRepo.save(u);
    } else if (u.role !== 'politician') {
      u.role = 'politician';
      await this.userRepo.save(u);
    }
    return u;
  }

  @HttpPost()
  async create(
    @Body() body: { authorId?: string; title?: string; content: string; tags?: string[] },
    @Request() req: any,
  ) {
    this.assertAdmin(req);
    if (!body?.content || body.content.trim() === '') throw new BadRequestException('content required');

    let author: User | null = null;
    if (body.authorId) {
      author = await this.userRepo.findOne({ where: { id: body.authorId } });
      if (!author) throw new BadRequestException('author not found');
      if (author.role !== 'politician') throw new BadRequestException('author must be politician');
    } else {
      author = await this.ensureOperatorPolitician();
    }

    const p = this.postRepo.create({
      authorId: author.id,
      body: body.content,
      title: body.title,
      tags: body.tags as any,
    } as Partial<PostEntity>);

    const saved = await this.postRepo.save(p); // saved: PostEntity

    return {
      id: saved.id,
      authorId: saved.authorId,
      title: (saved as any).title,
      body: saved.body,
      createdAt: saved.createdAt,
    };
  }
}