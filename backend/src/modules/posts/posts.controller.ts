import { Body, Controller, Get, Param, Post as PostMethod, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @PostMethod()
  async create(@Body() dto: CreatePostDto, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.posts.create(userId, dto);
  }

  @Get()
  async list(@Query() query: QueryPostsDto) {
    return this.posts.list(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.posts.findById(id);
  }
}