import { Controller, Get, Param, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Controller('policies')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(
    private readonly svc: PoliciesService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get('politician/:id')
  async list(@Param('id') politicianId: string) {
    return this.svc.list(politicianId);
  }

  @Post('politician/:id')
  async create(
    @Param('id') politicianId: string,
    @Body() body: { title: string; description?: string; category?: string; status?: string },
    @Request() req: any,
  ) {
    const actor = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!actor || (actor.role !== 'admin' && actor.id !== politicianId)) {
      throw new (require('@nestjs/common').ForbiddenException)('not allowed');
    }
    return this.svc.create(politicianId, body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() patch: any,
    @Request() req: any,
  ) {
    const actor = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!actor) throw new (require('@nestjs/common').ForbiddenException)('not allowed');
    return this.svc.update(id, actor, patch);
  }
}