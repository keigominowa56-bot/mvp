import { Body, Controller, Delete, Get, Param, Post as PostMethod, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @PostMethod()
  async create(@Body() dto: any, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.posts.create(userId, dto);
  }

  @Get()
  async list(@Query() query: { type?: string; region?: string; q?: string; page?: number; limit?: number; authorUserId?: string }) {
    return this.posts.list(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.posts.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    const userRole = req.user?.role || 'user';
    return this.posts.softDelete(id, userId, userRole);
  }
}
