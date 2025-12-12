import { Body, Controller, Get, Param, Post as PostMethod, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @PostMethod()
  async create(@Body() dto: any, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.posts.create(userId, dto);
  }

  @Get()
  async list(@Query() query: { type?: string; region?: string; q?: string; page?: number; limit?: number }) {
    return this.posts.list(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.posts.findById(id);
  }
}