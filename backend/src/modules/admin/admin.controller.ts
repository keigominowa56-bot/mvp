import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Post } from 'src/entities/post.entity';
import { Vote } from 'src/entities/vote.entity';

@Controller('api/admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Vote) private readonly voteRepo: Repository<Vote>,
  ) {}

  @Get('users')
  async listUsers() {
    return this.users.find();
  }

  @Get('posts/analytics')
  async getPostsAnalytics() {
    // 全投稿＋投稿者情報取得
    const allPosts = await this.posts.find({ relations: ['author'] });

    // 全投票を一気に取得
    const allVotes = await this.voteRepo.find();

    return allPosts.map((p) => {
      // 投稿に紐づく投票を抽出
      const votesForThisPost = allVotes.filter((v: any) => v.postId === p.id);
      // support/oppose集計（anyにより型エラー回避）
      const likeCount = votesForThisPost.filter((v: any) => v.type === 'support').length;
      const disagreeCount = votesForThisPost.filter((v: any) => v.type === 'oppose').length;
      const commentCount = 0; // コメント機能追加時はここを拡張
      return {
        id: p.id,
        title: p.title,
        likes: likeCount,
        comments: commentCount,
        disagrees: disagreeCount,
        authorId: p.authorUserId ?? (p.author?.id ?? null),
      };
    });
  }

  @Get('comments')
  async getAllComments() {
    // コメントAPIは必要あれば拡張
    return [];
  }
}