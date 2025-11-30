import { Controller, Post, Body, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';

@Controller('admin/politicians')
@UseGuards(JwtAuthGuard)
export class AdminPoliticiansController {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admins only');
  }

  @Post()
  async createPolitician(
    @Body() body: {
      email: string;
      password?: string;
      name?: string;
      kana?: string;
      party?: string;
      constituency?: string;
      termCount?: number;
      xHandle?: string;
      instagramHandle?: string;
      facebookUrl?: string;
      youtubeUrl?: string;
      websiteUrl?: string;
    },
    @Request() req: any
  ) {
    this.ensureAdmin(req);
    if (!body.email) throw new BadRequestException('email required');
    const exist = await this.userRepo.findOne({ where: { email: body.email } });
    if (exist) throw new BadRequestException('email already exists');

    const passwordHash = await bcrypt.hash(body.password || 'temp-password', 10);
    const u = this.userRepo.create({
      email: body.email,
      passwordHash,
      role: 'politician',
      status: 'active',
      kycStatus: 'verified',
      planTier: 'pro',
      name: body.name,
      kana: body.kana,
      party: body.party,
      constituency: body.constituency,
      termCount: body.termCount,
      xHandle: body.xHandle,
      instagramHandle: body.instagramHandle,
      facebookUrl: body.facebookUrl,
      youtubeUrl: body.youtubeUrl,
      websiteUrl: body.websiteUrl,
    });
    const saved = await this.userRepo.save(u);
    return { created: true, id: saved.id, email: saved.email };
  }
}