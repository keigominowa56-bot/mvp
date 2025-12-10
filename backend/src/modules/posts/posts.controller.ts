// backend/src/modules/posts/posts.controller.ts

import { 
  Controller, 
  Get, 
  Query, 
  Post as HttpPost, 
  Body, 
  Param, 
  Patch, 
  Req, 
  UnauthorizedException,
  UseGuards // 👈 追加
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// 👇 新しく追加するインポート 👇
import { RolesGuard } from '../../common/guards/roles.guard';     // ステップ3で作成
import { Roles } from '../../common/decorators/roles.decorator'; // ステップ2で作成
import { UserRole } from '../users/user.entity';                 // ステップ1で定義
// 👆 新しく追加するインポート 👆

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  // 👇 投稿権限の制限を追加する箇所 👇
  @UseGuards(RolesGuard) // 👈 ロールガードを適用（AuthGuardは既存のコードで処理されていると仮定）
  @Roles(UserRole.POLITICIAN, UserRole.ADMIN) // 👈 許可するロールを指定
  @HttpPost()
  async create(@Body() dto: CreatePostDto, @Req() req: any) {
    // ⚠️ 前提: 既存の認証処理によって req.user にロール情報が格納されていること
    // RolesGuard がここで権限チェックを行い、権限がない場合はリクエストがブロックされます。
    
    const userId = req.user?.sub; // JWTなどからユーザーIDを取得
    
    // RolesGuardによってすでにチェックされていますが、念のため認証チェックは残しておきます
    if (!userId) {
      // RolesGuardが機能しない場合のフォールバックとして残します
      throw new UnauthorizedException();
    } 
    
    // ユーザーIDとDTOを使って投稿を作成
    return this.posts.create(userId, dto);
  }
  // 👆 投稿権限の制限を追加する箇所 👆

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.update(userId, id, dto);
  }

  @Patch(':id/delete')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.softDelete(userId, id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.posts.restore(userId, id);
  }

  @Get('/feed')
  async feed(@Query('category') category?: 'policy' | 'activity', @Query('pref') pref?: string, @Query('city') city?: string) {
    return this.posts.getFeed({ category, pref, city });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.posts.getById(id);
  }
}