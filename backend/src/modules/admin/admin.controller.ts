import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  private assertAdmin(req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admins only');
  }

  @Get()
  async list(
    @Request() req: any,
    @Query('q') q?: string,
    @Query('role') role?: 'user' | 'politician' | 'admin',
    @Query('kycStatus') kycStatus?: 'pending' | 'verified' | 'rejected',
    @Query('planTier') planTier?: 'free' | 'pro',
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
  ) {
    this.assertAdmin(req);
    const page = Math.max(1, Number(pageQ) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(pageSizeQ) || 20));
    const where: any = {};
    const whereArr: any[] = [];

    if (q) {
      const like = ILike(`%${q}%`);
      whereArr.push({ email: like });
      whereArr.push({ name: like });
    }
    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;
    if (planTier) where.planTier = planTier;

    const [items, total] = await this.userRepo.findAndCount({
      where: whereArr.length ? whereArr.map((w) => ({ ...w, ...where })) : where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        kycStatus: u.kycStatus,
        planTier: u.planTier,
        name: u.name,
        age: u.age,
        addressPref: u.addressPref,
        addressCity: u.addressCity,
      })),
      total,
      page,
      pageSize,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { role?: 'user' | 'politician' | 'admin'; kycStatus?: 'pending' | 'verified' | 'rejected'; planTier?: 'free' | 'pro' },
    @Request() req: any,
  ) {
    this.assertAdmin(req);
    const u = await this.userRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    if (body.role) u.role = body.role;
    if (body.kycStatus) u.kycStatus = body.kycStatus;
    if (body.planTier) u.planTier = body.planTier;
    await this.userRepo.save(u);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      kycStatus: u.kycStatus,
      planTier: u.planTier,
      name: u.name,
      age: u.age,
      addressPref: u.addressPref,
      addressCity: u.addressCity,
    };
  }
}