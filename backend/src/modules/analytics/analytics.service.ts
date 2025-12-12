import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Post } from 'src/entities/post.entity';
import { Comment } from 'src/entities/comment.entity';
import { Vote } from 'src/entities/vote.entity';
import { Follow } from 'src/entities/follow.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { VoteChoice } from 'src/enums/vote-choice.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(Vote) private readonly votes: Repository<Vote>,
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
  ) {}

  private async assertPolitician(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRoleEnum.POLITICIAN && user.role !== UserRoleEnum.ADMIN) {
      throw new NotFoundException('Not a politician');
    }
    return user;
  }

  async myPostsSummary(userId: string) {
    await this.assertPolitician(userId);
    const posts = await this.posts.find({ where: { authorUserId: userId } });
    const result = [];

    for (const p of posts) {
      const votes = await this.votes.find({ where: { postId: p.id } });
      const commentsCount = await this.comments.count({ where: { postId: p.id } });

      const agree = votes.filter((v) => v.choice === VoteChoice.AGREE).length;
      const disagree = votes.filter((v) => v.choice === VoteChoice.DISAGREE).length;

      result.push({
        postId: p.id,
        title: p.title,
        type: p.type,
        createdAt: p.createdAt,
        votes: { agree, disagree, total: votes.length },
        comments: commentsCount,
      });
    }

    result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return result;
  }

  async followersDemographics(userId: string) {
    await this.assertPolitician(userId);
    const rows = await this.follows
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.follower', 'user')
      .leftJoinAndSelect('user.region', 'region')
      .leftJoinAndSelect('user.supportedParty', 'party')
      .where('f.targetUserId = :uid', { uid: userId })
      .getMany();

    const agg = {
      total: rows.length,
      ageGroup: {} as Record<string, number>,
      region: {} as Record<string, number>,
      party: {} as Record<string, number>,
    };

    for (const r of rows) {
      const age = (r as any).follower?.ageGroup ?? 'unknown';
      const regionName = (r as any).follower?.region?.name ?? 'unknown';
      const partyName = (r as any).follower?.supportedParty?.name ?? 'unknown';
      agg.ageGroup[age] = (agg.ageGroup[age] || 0) + 1;
      agg.region[regionName] = (agg.region[regionName] || 0) + 1;
      agg.party[partyName] = (agg.party[partyName] || 0) + 1;
    }
    return agg;
  }

  async exportMyPostsCsv(userId: string): Promise<string> {
    const rows = await this.myPostsSummary(userId);
    const header = ['postId', 'title', 'type', 'createdAt', 'votesAgree', 'votesDisagree', 'votesTotal', 'comments'];
    const lines = [header.join(',')];

    for (const r of rows) {
      lines.push(
        [
          r.postId,
          escapeCsv(r.title),
          r.type,
          new Date(r.createdAt).toISOString(),
          r.votes.agree,
          r.votes.disagree,
          r.votes.total,
          r.comments,
        ].join(','),
      );
    }
    return lines.join('\n');

    function escapeCsv(val: any) {
      const s = String(val ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }
  }
}