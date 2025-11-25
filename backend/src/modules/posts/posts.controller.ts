import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly svc: PostsService) {}

  // 公開 GET（未ログインでもOK）: フロントの一覧表示を優先
  @Get()
  list() {
    return this.svc.findAll();
  }

  // 作成は認証必須
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: { body: string; images?: string[] }) {
    return this.svc.create(req.user, dto.body, dto.images || []);
  }
}