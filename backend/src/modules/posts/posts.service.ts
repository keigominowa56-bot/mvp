import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../entities/user.entity';

interface CreatePostDto {
  authorId?: string;
  title?: string;
  body: string;
  tags?: string[];
  regionPref?: string;
  regionCity?: string;
}

interface UpdatePostDto {
  title?: string;
  body?: string;
  tags?: string[];
  regionPref?: string;
  regionCity?: string;
  hidden?: boolean;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 投稿作成（politician本人 or admin）
   */
  async create(dto: CreatePostDto, actorId: string) {
    if (!dto.body || !dto.body.trim()) {
      throw new BadRequestException('body required');
    }

    const actor = await this.userRepo.findOne({ where: { id: actorId } });
    if (!actor) throw new ForbiddenException('actor not found');

    const authorId = dto.authorId || actorId;
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new BadRequestException('author not found');

    // 権限チェック
    if (actor.role === 'admin') {
      // adminは任意名義OK
    } else if (actor.role === 'politician') {
      if (actor.id !== authorId) {
        throw new ForbiddenException('politician can only post as themselves');
      }
    } else {
      throw new ForbiddenException('only admin or politician can post');
    }

    const post = this.postRepo.create({
      authorId,
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      regionPref: dto.regionPref,
      regionCity: dto.regionCity,
      hidden: false,
    });

    return this.postRepo.save(post);
  }

  /**
   * 投稿更新（投稿者本人 or admin）
   */
  async update(id: string, dto: UpdatePostDto, actorId: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new BadRequestException('post not found');

    const actor = await this.userRepo.findOne({ where: { id: actorId } });
    if (!actor) throw new ForbiddenException('actor not found');

    if (actor.role !== 'admin' && actor.id !== post.authorId) {
      throw new ForbiddenException('not allowed to update this post');
    }

    if (dto.title !== undefined) post.title = dto.title || undefined;
    if (dto.body !== undefined) {
      if (!dto.body.trim()) throw new BadRequestException('body required');
      post.body = dto.body;
    }
    if (dto.tags !== undefined) post.tags = dto.tags;
    if (dto.regionPref !== undefined) post.regionPref = dto.regionPref || undefined;
    if (dto.regionCity !== undefined) post.regionCity = dto.regionCity || undefined;
    if (dto.hidden !== undefined) post.hidden = !!dto.hidden;

    return this.postRepo.save(post);
  }

  /**
   * 単一取得（必要なら拡張）
   */
  async findOne(id: string) {
    const p = await this.postRepo.findOne({ where: { id } });
    if (!p) throw new BadRequestException('post not found');
    return p;
  }
}