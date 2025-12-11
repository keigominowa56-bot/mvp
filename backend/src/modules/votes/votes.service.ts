import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../../entities/vote.entity';
import { Post } from '../../entities/post.entity';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private readonly votes: Repository<Vote>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
  ) {}

  async cast(postId: string, voterUserId: string, dto: CreateVoteDto) {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    // 1ユーザー1回（Unique制約で担保し、サービス層で409返す）
    const existing = await this.votes.findOne({ where: { postId, voterUserId } });
    if (existing) throw new ConflictException('Already voted');

    const vote = this.votes.create({ postId, voterUserId, choice: dto.choice });
    return this.votes.save(vote);
  }

  async summary(postId: string) {
    const rows = await this.votes.find({ where: { postId } });
    const summary = rows.reduce(
      (acc, v) => {
        acc[v.choice] = (acc[v.choice] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return { postId, summary, total: rows.length };
  }
}