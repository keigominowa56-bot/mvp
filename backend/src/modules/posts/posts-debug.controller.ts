import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { PoliticianProfileExtended } from '../../entities/politician-profile-extended.entity';
import { Post } from '../../entities/post.entity';

@Controller('api/debug')
export class PostsDebugController {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(PoliticianProfileExtended) private readonly extendedRepo: Repository<PoliticianProfileExtended>,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
  ) {}

  @Get('users')
  async debugUsers(@Query('limit') limit?: string) {
    const users = await this.usersRepo.find({
      take: limit ? parseInt(limit) : 10,
      select: ['id', 'name', 'username', 'profileImageUrl', 'role', 'email'],
    });
    return {
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        profileImageUrl: u.profileImageUrl,
        role: u.role,
        hasName: !!u.name,
      })),
    };
  }

  @Get('politician-profiles')
  async debugPoliticianProfiles(@Query('limit') limit?: string) {
    const profiles = await this.extendedRepo.find({
      take: limit ? parseInt(limit) : 10,
    });
    return {
      count: profiles.length,
      profiles: profiles.map(p => ({
        userId: p.userId,
        name: p.name,
        profileImageUrl: p.profileImageUrl,
        hasName: !!p.name,
      })),
    };
  }

  @Get('posts-with-authors')
  async debugPostsWithAuthors(@Query('limit') limit?: string) {
    const posts = await this.postsRepo.find({
      take: limit ? parseInt(limit) : 5,
      relations: ['author'],
    });
    return {
      count: posts.length,
      posts: posts.map(p => ({
        id: p.id,
        authorId: p.authorUserId,
        author: p.author ? {
          id: p.author.id,
          name: p.author.name,
          username: p.author.username,
          role: (p.author as any).role,
          hasName: !!p.author.name,
        } : null,
      })),
    };
  }
}

