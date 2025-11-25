import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private repo: Repository<Post>) {}

  async create(user: any, body: string, _images: string[] = []) {
    if (!user?.id) throw new BadRequestException('ユーザー不明');
    const post = this.repo.create({
      authorId: user.id,
      body,
      // images は保存先が未確定のため一旦未使用。必要になったらカラムに合わせて保存してください。
    });
    return this.repo.save(post);
  }

  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }
}