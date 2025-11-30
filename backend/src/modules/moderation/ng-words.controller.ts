import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { NgWordsService } from './ng-words.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/ng-words')
@UseGuards(JwtAuthGuard)
export class NgWordsController {
  constructor(private readonly svc: NgWordsService) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admins only');
  }

  @Get()
  async list(@Request() req: any) {
    this.ensureAdmin(req);
    return this.svc.list();
  }

  @Post()
  async add(@Body('word') word: string, @Request() req: any) {
    this.ensureAdmin(req);
    return this.svc.add(word);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    this.ensureAdmin(req);
    return this.svc.remove(id);
  }
}