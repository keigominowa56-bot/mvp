import { Controller, Get, Query, Post as HttpPost, Body, Param, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @HttpPost()
  async create(@Body() dto: CreatePostDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.create(userId, dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.update(userId, id, dto);
  }

  @Patch(':id/delete')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.softDelete(userId, id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.restore(userId, id);
  }

  @Get('/feed')
  async feed(@Query('category') category?: 'policy' | 'activity', @Query('pref') pref?: string, @Query('city') city?: string) {
    return this.posts.getFeed({ category, pref, city });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.posts.getById(id);
  }
}