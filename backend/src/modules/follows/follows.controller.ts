import { Controller, Post, Delete, Get, Body, UseGuards, Request, BadRequestException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(
    private readonly follows: FollowsService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Post()
  async follow(@Body('politicianId') politicianId: string, @Request() req: any) {
    if (!politicianId) throw new BadRequestException('politicianId required');
    return this.follows.follow(req.user.sub, politicianId);
  }

  @Delete()
  async unfollow(@Body('politicianId') politicianId: string, @Request() req: any) {
    if (!politicianId) throw new BadRequestException('politicianId required');
    return this.follows.unfollow(req.user.sub, politicianId);
  }

  @Get('my')
  async my(@Request() req: any) {
    return this.follows.listFollowing(req.user.sub);
  }

  // おすすめ政治家（未フォローの政治家を返す）
  @Get('recommendations')
  async recommendations(
    @Request() req: any,
    @Query('limit') limitQ?: string,
    @Query('q') q?: string,
  ) {
    const limit = Math.min(50, Math.max(1, Number(limitQ) || 10));
    const followerId = req.user.sub;

    // 既にフォローしている政治家IDを取得
    const existing = await this.follows['followRepo'].find({ where: { followerId } });
    const followedIds = existing.map((f) => f.politicianId);

    // 検索条件
    const qb = this.userRepo.createQueryBuilder('u')
      .where('u.role = :role', { role: 'politician' })
      .andWhere('u.id != :me', { me: followerId });

    if (followedIds.length > 0) {
      qb.andWhere('u.id NOT IN (:...ids)', { ids: followedIds });
    }

    if (q && q.trim() !== '') {
      qb.andWhere('(u.name LIKE :kw OR u.email LIKE :kw)', { kw: `%${q}%` });
    }

    const users = await qb.orderBy('u.createdAt', 'DESC').limit(limit).getMany();

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      addressPref: u.addressPref,
      addressCity: u.addressCity,
    }));
  }
}