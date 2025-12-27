import { Controller, Get, Post as PostMethod, Param, UseGuards, Req, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { Post } from 'src/entities/post.entity';
import { Vote } from 'src/entities/vote.entity';
import { Comment } from 'src/entities/comment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from 'src/enums/notification-type.enum';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Vote) private readonly voteRepo: Repository<Vote>,
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('users')
  async listUsers() {
    return this.users.find();
  }

  @PostMethod('users/:id/approve')
  async approveUser(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      throw new Error('この機能は管理者のみ利用できます');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    user.status = 'approved';
    await this.users.save(user);
    return { ok: true };
  }

  @PostMethod('users/:id/reject')
  async rejectUser(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      throw new Error('この機能は管理者のみ利用できます');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    user.status = 'rejected';
    await this.users.save(user);
    return { ok: true };
  }

  @PostMethod('users/:id/allow-engagement')
  async allowEngagement(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      throw new Error('この機能は管理者のみ利用できます');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    user.allowedEngagement = true;
    await this.users.save(user);
    return { ok: true };
  }

  @PostMethod('users/:id/revoke-engagement')
  async revokeEngagement(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      throw new Error('この機能は管理者のみ利用できます');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    user.allowedEngagement = false;
    await this.users.save(user);
    return { ok: true };
  }

  @Get('posts/analytics')
  async getPostsAnalytics(@Req() req: any) {
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'admin';
    const hasEngagementAccess = isAdmin || currentUser?.allowedEngagement;
    
    // 全投稿＋投稿者情報取得
    const allPosts = await this.posts.find({ relations: ['author'] });

    // 全投票を一気に取得
    const allVotes = await this.voteRepo.find();
    
    // 全コメントを一気に取得
    const allComments = await this.commentsRepo.find({ relations: ['author'] });

    // 全ユーザーを取得（属性分析用）
    const allUsers = await this.users.find();

    return allPosts.map((p) => {
      // 投稿に紐づく投票を抽出
      const votesForThisPost = allVotes.filter((v: any) => v.postId === p.id);
      // agree/disagree集計
      const agreeCount = votesForThisPost.filter((v: any) => v.choice === 'agree').length;
      const disagreeCount = votesForThisPost.filter((v: any) => v.choice === 'disagree').length;
      const commentCount = allComments.filter((c: any) => c.postId === p.id).length;
      
      // 詳細分析（管理者または許可された議員のみ）
      let analytics = null;
      if (hasEngagementAccess) {
        // ユーザー属性の分析
        const voteUserIds = votesForThisPost.map((v: any) => v.voterUserId);
        const commentUserIds = allComments.filter((c: any) => c.postId === p.id).map((c: any) => c.authorUserId);
        const allEngagedUserIds = [...new Set([...voteUserIds, ...commentUserIds])];
        
        const engagedUsers = allUsers.filter((u: any) => allEngagedUserIds.includes(u.id));
        
        // 年代別集計
        const ageGroups: Record<string, number> = {};
        engagedUsers.forEach((u: any) => {
          const ageGroup = u.ageGroup || '不明';
          ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
        });
        
        // 地域別集計
        const regions: Record<string, number> = {};
        engagedUsers.forEach((u: any) => {
          const region = u.addressPref || '不明';
          regions[region] = (regions[region] || 0) + 1;
        });
        
        // 支持政党別集計
        const parties: Record<string, number> = {};
        engagedUsers.forEach((u: any) => {
          const partyId = u.supportedPartyId || '無所属';
          parties[partyId] = (parties[partyId] || 0) + 1;
        });
        
        analytics = {
          ageGroups,
          regions,
          parties,
          engagedUsers: engagedUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            ageGroup: u.ageGroup,
            region: u.addressPref,
            partyId: u.supportedPartyId,
          })),
        };
      }
      
      return {
        id: p.id,
        title: p.title,
        likes: agreeCount,
        comments: commentCount,
        disagrees: disagreeCount,
        authorId: p.authorUserId ?? (p.author?.id ?? null),
        analytics,
      };
    });
  }

  @Get('comments')
  @UseGuards(AuthGuard('jwt'))
  async getAllComments(@Req() req: any) {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        throw new Error('認証が必要です');
      }
      
      const isAdmin = currentUser?.role === 'admin';
      const userId = currentUser?.sub ?? currentUser?.id;
      
      if (!userId) {
        throw new Error('ユーザーIDが取得できません');
      }
      
      console.log(`[AdminController] getAllComments - userId: ${userId}, role: ${currentUser?.role}, isAdmin: ${isAdmin}`);
      
      // 親コメントのみを取得（返信はchildrenとして含める）
      let comments = await this.commentsRepo.find({
        where: { parentId: null as any },
        relations: ['author', 'post', 'children', 'children.author'],
        order: { createdAt: 'DESC' },
        take: 100,
      });
      
      console.log(`[AdminController] 取得したコメント数: ${comments.length}`);
      
      // 議員の場合は自分の投稿へのコメントのみ表示
      if (!isAdmin && currentUser?.role === 'politician') {
        try {
          const myPosts = await this.posts.find({ 
            where: { authorUserId: userId, deletedAt: null as any },
            select: ['id'],
          });
          const myPostIds = myPosts.map(p => p.id);
          console.log(`[AdminController] 議員の投稿ID: ${myPostIds.join(', ')}`);
          comments = comments.filter(c => {
            const matches = myPostIds.includes(c.postId);
            if (!matches) {
              console.log(`[AdminController] コメント ${c.id} は自分の投稿へのコメントではない (postId: ${c.postId})`);
            }
            return matches;
          });
          console.log(`[AdminController] 議員の投稿数: ${myPosts.length}, フィルタ後のコメント数: ${comments.length}`);
        } catch (err) {
          console.error('[AdminController] 議員の投稿取得エラー:', err);
          throw err; // エラーを再スローして、適切なエラーレスポンスを返す
        }
      }
      
      return comments.map((c: any) => {
        // postTitleを確実に取得
        let postTitle = '投稿が見つかりません';
        if (c.post) {
          postTitle = c.post.title || c.post.content?.slice(0, 50) || '投稿';
        } else if (c.postId) {
          // postが読み込まれていない場合、postIdから推測
          postTitle = `投稿ID: ${c.postId.slice(0, 8)}`;
        }
        
        return {
          id: c.id,
          postId: c.postId,
          postTitle,
          content: c.content,
          author: c.author?.name || c.authorUserId?.slice(0, 8) || 'ユーザー',
          authorUserId: c.authorUserId,
          createdAt: c.createdAt,
          parentId: c.parentId,
          children: (c.children || []).map((child: any) => ({
            id: child.id,
            content: child.content,
            author: child.author?.name || child.authorUserId?.slice(0, 8) || 'ユーザー',
            authorUserId: child.authorUserId,
            createdAt: child.createdAt,
          })),
        };
      });
    } catch (error: any) {
      console.error('[AdminController] getAllComments エラー:', error);
      console.error('[AdminController] エラー詳細:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      // HttpExceptionとして適切にエラーを返す
      throw new HttpException(
        error.message || 'コメントの取得に失敗しました',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @PostMethod('notifications/send')
  async sendNotification(
    @Req() req: any,
    @Body() body: {
      title: string;
      body: string;
      filters?: {
        role?: string;
        addressPref?: string;
        addressCity?: string;
        ageGroup?: string;
        supportedPartyId?: string;
      };
    },
  ) {
    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      throw new Error('この機能は管理者のみ利用できます');
    }

    // フィルター条件に基づいてユーザーを取得
    const where: any = {};
    if (body.filters?.role) {
      where.role = body.filters.role;
    }
    if (body.filters?.addressPref) {
      where.addressPref = body.filters.addressPref;
    }
    if (body.filters?.addressCity) {
      where.addressCity = body.filters.addressCity;
    }
    if (body.filters?.ageGroup) {
      where.ageGroup = body.filters.ageGroup;
    }
    if (body.filters?.supportedPartyId) {
      where.supportedPartyId = body.filters.supportedPartyId;
    }

    const targetUsers = await this.users.find({ where });

    // 各ユーザーに通知を送信
    let successCount = 0;
    for (const user of targetUsers) {
      try {
        await this.notificationsService.create(
          user.id,
          NotificationType.ANNOUNCEMENT,
          body.title,
          body.body,
        );
        successCount++;
      } catch (err) {
        console.error(`ユーザー ${user.id} への通知送信に失敗:`, err);
      }
    }

    return { 
      ok: true, 
      count: successCount,
      total: targetUsers.length,
    };
  }
}