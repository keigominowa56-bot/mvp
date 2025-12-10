// backend/src/modules/posts/posts.service.ts

import { Injectable, UnprocessableEntityException, ForbiddenException, NotFoundException } from '@nestjs/common'; // 👈 NotFoundException をインポート
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NgWordsService } from '../moderation/ng-words.service';
import { ActivityLogService } from '../activity-logs/activity-log.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly ng: NgWordsService,
    private readonly logs: ActivityLogService,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    const targetText = `${dto.title || ''} ${dto.body}`;
    const { found } = await this.ng.containsNg(targetText);
    if (found.length) throw new UnprocessableEntityException(`NGワード: ${found.join(', ')}`);

    const author = await this.users.findOne({ where: { id: userId } });
    if (!author) throw new Error('User not found');

    const hidden =
      (dto as any).hidden !== undefined
        ? Boolean((dto as any).hidden)
        : dto.visibility
        ? dto.visibility === 'hidden'
        : false;

    const post = this.repo.create({
      body: dto.body,
      title: dto.title,
      postCategory: dto.postCategory ?? 'activity',
      hidden,
      regionPref: dto.regionPref,
      regionCity: dto.regionCity,
      author,
      deletedAt: null,
    });

    const saved = await this.repo.save(post);
    await this.logs.log(userId, 'post_created', { postId: saved.id, postCategory: saved.postCategory, hidden: saved.hidden });
    return saved;
  }

  async update(userId: string, id: string, dto: UpdatePostDto) {
    const post = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!post) throw new UnprocessableEntityException('Post not found');

    // 自分の投稿以外の編集は原則不可（adminは別途ロールで許可する想定）
    if (post.author.id !== userId) {
      // ここで user の role を見て admin であれば許可、などのチェックを入れても良い
      // 今回は自分以外は拒否
      throw new ForbiddenException('You cannot edit this post');
    }

    const toUpdate: Partial<Post> = {};

    if (dto.body !== undefined) {
      const { found } = await this.ng.containsNg(dto.body);
      if (found.length) throw new UnprocessableEntityException(`NGワード(body): ${found.join(', ')}`);
      toUpdate.body = dto.body;
    }
    if (dto.title !== undefined) {
      const { found } = await this.ng.containsNg(dto.title);
      if (found.length) throw new UnprocessableEntityException(`NGワード(title): ${found.join(', ')}`);
      toUpdate.title = dto.title;
    }
    if (dto.postCategory !== undefined) toUpdate.postCategory = dto.postCategory;
    if ((dto as any).hidden !== undefined) toUpdate.hidden = Boolean((dto as any).hidden);
    else if (dto.visibility !== undefined) toUpdate.hidden = dto.visibility === 'hidden';
    if (dto.regionPref !== undefined) toUpdate.regionPref = dto.regionPref;
    if (dto.regionCity !== undefined) toUpdate.regionCity = dto.regionCity;

    await this.repo.update({ id }, toUpdate);
    const updated = await this.repo.findOne({ where: { id } });
    await this.logs.log(userId, 'post_updated', { postId: id, changed: Object.keys(toUpdate) });
    return updated;
  }

  async softDelete(userId: string, id: string) {
    const post = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!post) throw new UnprocessableEntityException('Post not found');
    if (post.author.id !== userId) throw new ForbiddenException('You cannot delete this post');
    if (post.deletedAt) return post;
    post.deletedAt = new Date();
    const saved = await this.repo.save(post);
    await this.logs.log(userId, 'post_deleted', { postId: id });
    return saved;
  }

  async restore(userId: string, id: string) {
    const post = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!post) throw new UnprocessableEntityException('Post not found');
    if (post.author.id !== userId) throw new ForbiddenException('You cannot restore this post');
    if (!post.deletedAt) return post;
    post.deletedAt = null;
    const saved = await this.repo.save(post);
    await this.logs.log(userId, 'post_restored', { postId: id });
    return saved;
  }

  async getFeed(filter: { category?: 'policy' | 'activity'; pref?: string; city?: string }) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .where('p.hidden = :hidden', { hidden: false })
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.createdAt', 'DESC');

    if (filter.category) qb.andWhere('p.postCategory = :cat', { cat: filter.category });
    if (filter.pref) qb.andWhere('p.regionPref = :pref', { pref: filter.pref });
    if (filter.city) qb.andWhere('p.regionCity = :city', { city: filter.city });

    return qb.getMany();
  }

  async getById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  // 👇 ここから新しいメソッドを追加します 👇
  /**
   * 投稿IDから作者IDのみを取得します。コメント通知のために使用されます。
   */
  async getAuthorId(id: number | string) {
    // IDはstringのことが多いですが、念のためnumberも許容
    const postId = typeof id === 'number' ? id.toString() : id;

    const post = await this.repo.findOne({ 
      where: { id: postId },
      select: ['id', 'author'], // IDと作者情報のみを選択
      relations: ['author'], // 作者エンティティをロード
    });

    if (!post) throw new NotFoundException('Post not found');
    
    // author リレーションがロードされていることを確認
    if (!post.author || !post.author.id) {
        throw new UnprocessableEntityException('Post author information missing');
    }

    // 投稿IDと作者IDを返却
    return { postId: post.id, authorId: post.author.id };
  }
  // 👆 ここまで新しいメソッドを追加します 👆
}