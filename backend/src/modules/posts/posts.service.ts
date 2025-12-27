import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from 'src/entities/post.entity';
import { Vote } from 'src/entities/vote.entity';
import { Comment } from 'src/entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly repo: Repository<Post>,
    @InjectRepository(Vote) private readonly votesRepo: Repository<Vote>,
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
  ) {}

  async create(userId: string, dto: { title: string; content: string; type: string; imageUrl?: string; videoUrl?: string }) {
    const post = this.repo.create({
      title: dto.title,
      content: dto.content,
      type: dto.type,
      imageUrl: dto.imageUrl || null,
      videoUrl: dto.videoUrl || null,
      authorUserId: userId, // リレーションオブジェクトではなく外部キー
    } as any);
    return this.repo.save(post);
  }

  async list(query: {
    type?: string;
    authorUserId?: string;
    search?: string;
    limit?: number;
    beforeId?: string;
  }) {
    let qb: SelectQueryBuilder<Post> = this.repo.createQueryBuilder('p');

    // 論理削除されていない投稿のみを取得
    qb = qb.andWhere('p.deletedAt IS NULL');

    if (query.type) {
      qb = qb.andWhere('p.type = :type', { type: query.type });
    }
    if (query.authorUserId) {
      qb = qb.andWhere('p.authorUserId = :authorUserId', { authorUserId: query.authorUserId });
    }
    if (query.search) {
      qb = qb.andWhere('(p.title LIKE :search OR p.content LIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.beforeId) {
      qb = qb.andWhere('p.id < :beforeId', { beforeId: query.beforeId });
    }

    qb = qb.orderBy('p.createdAt', 'DESC');

    if (query.limit && Number.isFinite(query.limit)) {
      qb = qb.take(Math.max(1, Math.min(query.limit, 100)));
    } else {
      qb = qb.take(20);
    }

    // 著者情報も取得（@JoinColumnでauthorUserIdが指定されているので、通常のleftJoinAndSelectで動作する）
    qb = qb.leftJoinAndSelect('p.author', 'author');
    
    const posts = await qb.getMany();
    
    // デバッグ: authorが取得できているか確認
    console.log(`[PostsService] list - 取得した投稿数: ${posts.length}`);
    posts.forEach((post, index) => {
      console.log(`[PostsService] Post ${index + 1}: id=${post.id}, authorUserId=${post.authorUserId}, hasAuthor=${!!post.author}, authorName=${post.author?.name || 'null'}, authorUsername=${post.author?.username || 'null'}`);
    });
    
    // 各投稿の投票数とコメント数を取得し、議員の場合は拡張プロフィール情報も取得
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const votes = await this.votesRepo.find({ where: { postId: post.id } });
        const comments = await this.commentsRepo.find({ where: { postId: post.id } });
        const agreeCount = votes.filter((v) => v.choice === 'agree').length;
        const disagreeCount = votes.filter((v) => v.choice === 'disagree').length;
        
        // 著者情報を確実に取得（議員の場合は拡張プロフィール情報も取得）
        let authorWithExtended: any = null;
        
        // authorが取得できていない場合、authorUserIdから直接取得
        if (!post.author && post.authorUserId) {
          try {
            const { User } = await import('../../entities/user.entity');
            const userRepo = this.repo.manager.getRepository(User);
            const fullUser = await userRepo.findOne({ 
              where: { id: post.authorUserId },
              select: ['id', 'name', 'username', 'profileImageUrl', 'role', 'supportedPartyId'],
            });
            if (fullUser) {
              post.author = fullUser;
              console.log(`[PostsService] authorUserIdからUser取得: id=${fullUser.id}, name=${fullUser.name}, role=${fullUser.role}`);
            } else {
              console.warn(`[PostsService] User not found by authorUserId: ${post.authorUserId}`);
            }
          } catch (err) {
            console.error('authorUserIdからUser取得に失敗:', err);
          }
        }
        
        if (post.author && post.author.id) {
          // 常にUserエンティティから最新の情報を取得（nameが確実に取得できるように）
          let fullUser: any = null;
          try {
            const { User } = await import('../../entities/user.entity');
            const userRepo = this.repo.manager.getRepository(User);
            fullUser = await userRepo.findOne({ 
              where: { id: post.author.id },
              select: ['id', 'name', 'username', 'profileImageUrl', 'role', 'supportedPartyId'],
            });
            if (fullUser) {
              // 再取得したユーザー情報で上書き（nameを確実に含める）
              // nameがnullの場合はusernameをnameとして使用（フォールバック）
              post.author = { 
                ...post.author, 
                ...fullUser,
                name: fullUser.name || fullUser.username || post.author.name || post.author.username,
              };
              // デバッグログ
              console.log(`[PostsService] User再取得: id=${fullUser.id}, name=${fullUser.name}, username=${fullUser.username}, finalName=${post.author.name}, role=${fullUser.role}`);
            } else {
              console.warn(`[PostsService] User not found: id=${post.author.id}`);
            }
          } catch (err) {
            console.error('ユーザー情報の再取得に失敗:', err);
          }
          
          const baseRole = (post.author as any).role;
          // nameがnullの場合はusernameをnameとして使用（フォールバック）
          const baseName = post.author.name || post.author.username || null;
          
          if (baseRole === 'politician') {
            // 議員の場合は拡張プロフィール情報を取得（キャッシュを無効化）
            try {
              const { PoliticianProfileExtended } = await import('../../entities/politician-profile-extended.entity');
              const extendedRepo = this.repo.manager.getRepository(PoliticianProfileExtended);
              const extended = await extendedRepo.findOne({ 
                where: { userId: post.author.id },
                cache: false, // キャッシュを無効化
              });
              if (extended) {
                // 拡張プロフィールの名前を優先、なければ基本プロフィールの名前を使用
                const finalName = extended.name || baseName || null;
                console.log(`[PostsService] Politician extended: userId=${post.author.id}, extended.name=${extended.name}, baseName=${baseName}, finalName=${finalName}`);
                authorWithExtended = {
                  ...post.author,
                  party: extended.party || (post.author as any).supportedPartyId,
                  district: extended.district,
                  bio: extended.bio,
                  pledges: extended.pledges,
                  // 拡張プロフィールの画像を優先（拡張プロフィールに画像があればそれを使用、なければ基本プロフィールの画像）
                  profileImageUrl: extended.profileImageUrl || post.author.profileImageUrl || null,
                  // 名前も拡張プロフィールから取得（もしあれば）、なければ基本プロフィールの名前
                  name: finalName,
                  // usernameも確実に含める
                  username: post.author.username || null,
                };
              } else {
                // 拡張プロフィールが存在しない場合でも基本情報を確実に含める
                console.log(`[PostsService] Politician no extended: userId=${post.author.id}, baseName=${baseName}`);
                authorWithExtended = {
                  ...post.author,
                  profileImageUrl: post.author.profileImageUrl || null,
                  username: post.author.username || null,
                  name: baseName || null,
                };
              }
            } catch (err) {
              // 拡張プロフィール情報の取得に失敗した場合は基本情報のみ
              console.error('拡張プロフィール情報の取得に失敗:', err);
              authorWithExtended = {
                ...post.author,
                profileImageUrl: post.author.profileImageUrl || null,
                username: post.author.username || null,
                name: baseName || null,
              };
            }
          } else {
            // 一般ユーザーの場合もprofileImageUrlとusernameを確実に含める
            // nameがnullの場合は、usernameをnameとして使用する（フォールバック）
            const finalName = baseName || post.author.username || null;
            console.log(`[PostsService] Regular user: id=${post.author.id}, baseName=${baseName}, username=${post.author.username}, finalName=${finalName}`);
            authorWithExtended = {
              ...post.author,
              profileImageUrl: post.author.profileImageUrl || null,
              username: post.author.username || null,
              name: finalName, // nameがnullの場合はusernameを使用
            };
          }
        }
        
        const result = {
          ...post,
          author: authorWithExtended || post.author, // authorWithExtendedがnullの場合は元のauthorを使用
          agreeCount,
          disagreeCount,
          commentCount: comments.length,
        };
        
        // デバッグログ: 最終的なauthor情報を確認
        if (result.author) {
          console.log(`[PostsService] Final author for post ${post.id}:`, {
            id: result.author.id,
            name: result.author.name,
            username: result.author.username,
            role: (result.author as any).role,
            hasName: !!result.author.name,
          });
        } else {
          console.warn(`[PostsService] No author for post ${post.id}, authorUserId=${post.authorUserId}`);
        }
        
        return result;
      }),
    );
    
    return postsWithCounts;
  }

  async findById(id: string) {
    const post = await this.repo.findOne({
      where: { id, deletedAt: null as any },
      relations: ['author'],
    });
    
    // authorが取得できていない場合、authorUserIdから直接取得
    if (post && !post.author && post.authorUserId) {
      try {
        const { User } = await import('../../entities/user.entity');
        const userRepo = this.repo.manager.getRepository(User);
        const fullUser = await userRepo.findOne({ 
          where: { id: post.authorUserId },
          select: ['id', 'name', 'username', 'profileImageUrl', 'role', 'supportedPartyId'],
        });
        if (fullUser) {
          post.author = fullUser;
          console.log(`[PostsService] findById - authorUserIdからUser取得: id=${fullUser.id}, name=${fullUser.name}, role=${fullUser.role}`);
        } else {
          console.warn(`[PostsService] findById - User not found by authorUserId: ${post.authorUserId}`);
        }
      } catch (err) {
        console.error('findById - authorUserIdからUser取得に失敗:', err);
      }
    }
    
    if (!post || !post.author) {
      return post;
    }
    
    // 議員の場合は拡張プロフィール情報を取得
    let authorWithExtended: any = post.author;
    if ((post.author as any).role === 'politician') {
      try {
        const { PoliticianProfileExtended } = await import('../../entities/politician-profile-extended.entity');
        const extendedRepo = this.repo.manager.getRepository(PoliticianProfileExtended);
        const extended = await extendedRepo.findOne({ 
          where: { userId: post.author.id },
          cache: false,
        });
        if (extended) {
          authorWithExtended = {
            ...post.author,
            party: extended.party || (post.author as any).supportedPartyId,
            district: extended.district,
            bio: extended.bio,
            pledges: extended.pledges,
            profileImageUrl: extended.profileImageUrl || post.author.profileImageUrl,
            name: extended.name || post.author.name,
          };
        }
      } catch (err) {
        console.error('拡張プロフィール情報の取得に失敗:', err);
      }
    } else {
      // 一般ユーザーの場合もprofileImageUrlとusernameを確実に含める
      authorWithExtended = {
        ...post.author,
        profileImageUrl: post.author.profileImageUrl || null,
        username: post.author.username || null,
        name: post.author.name || null,
      };
    }
    
    return {
      ...post,
      author: authorWithExtended,
    };
  }

  async softDelete(id: string, userId: string, userRole: string) {
    console.log('[Posts Service] softDelete - 削除リクエスト. 投稿ID:', id, 'ユーザーID:', userId, 'Role:', userRole);
    
    const post = await this.repo.findOne({ where: { id, deletedAt: null as any } });
    if (!post) {
      console.error('[Posts Service] softDelete - 投稿が見つかりません. ID:', id);
      throw new Error('投稿が見つかりません');
    }

    console.log('[Posts Service] softDelete - 投稿情報. 著者ID:', post.authorUserId);

    // 権限チェック: adminはすべて削除可能、politicianは自分の投稿のみ削除可能
    if (userRole === 'admin') {
      console.log('[Posts Service] softDelete - 管理者権限で削除を許可');
    } else if (userRole === 'politician' && post.authorUserId === userId) {
      console.log('[Posts Service] softDelete - 議員が自分の投稿を削除');
    } else {
      console.error('[Posts Service] softDelete - 権限エラー. Role:', userRole, '著者ID:', post.authorUserId, 'ユーザーID:', userId);
      throw new Error('この投稿を削除する権限がありません');
    }

    post.deletedAt = new Date();
    const result = await this.repo.save(post);
    console.log('[Posts Service] softDelete - 削除完了');
    return result;
  }
}
