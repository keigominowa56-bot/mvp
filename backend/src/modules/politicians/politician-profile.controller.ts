import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/post.entity';

@Controller('politicians/profile')
export class PoliticianProfileController {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  // 指定の政治家（ユーザー）IDの直近投稿を10件
  @Get(':id/posts')
  async recentPosts(@Param('id') id: string) {
    const posts = await this.postRepo.find({
      where: { author: { id }, hidden: false },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    return posts;
  }
}