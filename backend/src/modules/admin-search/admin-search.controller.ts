import { Controller, Get, Query } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Controller('admin/search')
export class AdminSearchController {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  @Get('users')
  async searchUsers(@Query('q') q: string) {
    // 簡易検索（ILike 不使用）
    return this.usersRepo
      .createQueryBuilder('u')
      .where('u.email LIKE :q OR u.nickname LIKE :q', { q: `%${q}%` })
      .orderBy('u.createdAt', 'DESC')
      .take(50)
      .getMany();
  }
}