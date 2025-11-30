import { Controller, Get, Param, Query, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FundingService } from './funding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';

@Controller('funding')
@UseGuards(JwtAuthGuard)
export class FundingController {
  constructor(
    private readonly svc: FundingService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get('politicians/:id/records')
  async list(@Param('id') id: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.list(id, from, to);
  }

  @Get('politicians/:id/summary')
  async summary(@Param('id') id: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.summary(id, from, to);
  }

  @Post('politicians/:id/records')
  async create(
    @Param('id') id: string,
    @Body() body: { amount: number; category?: string; description?: string; date?: string },
    @Request() req: any,
  ) {
    const actor = await this.userRepo.findOne({ where: { id: req.user.sub } });
    return this.svc.create(id, actor!, body);
  }
}