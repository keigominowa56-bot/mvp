import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { Post } from '../posts/post.entity';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepo: Repository<Vote>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(userId: string, dto: CreateVoteDto) {
    const post = await this.postRepo.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.voteRepo.findOne({ where: { postId: dto.postId, userId } });
    if (existing) throw new BadRequestException('Already voted');

    const vote = this.voteRepo.create({
      postId: dto.postId,
      type: dto.type,
      userId,
    });
    await this.voteRepo.save(vote);
    return vote;
  }

  async update(userId: string, postId: string, type: 'support' | 'oppose') {
    const vote = await this.voteRepo.findOne({ where: { postId, userId } });
    if (!vote) throw new NotFoundException('Vote not found');
    vote.type = type;
    await this.voteRepo.save(vote);
    return vote;
  }

  async getVoteStats(postId: string) {
    const support = await this.voteRepo.count({ where: { postId, type: 'support' } });
    const oppose = await this.voteRepo.count({ where: { postId, type: 'oppose' } });
    return { support, oppose, total: support + oppose };
  }

  async findByPost(postId: string) {
    return this.voteRepo.find({ where: { postId }, order: { createdAt: 'DESC' } });
  }

  async getUserVote(userId: string, postId: string) {
    return this.voteRepo.findOne({ where: { userId, postId } });
  }
}