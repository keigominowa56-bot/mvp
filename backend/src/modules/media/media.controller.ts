import { Body, Controller, Delete, Get, Param, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('api/media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body()
    body: {
      category?: string | null;
      type: string;
      path: string;
      originalName?: string | null;
      sizeBytes?: number | null;
      mimeType?: string | null;
      meta?: Record<string, any> | null;
    },
  ) {
    const ownerUserId = req?.user?.sub ?? req?.user?.id ?? null;
    return this.svc.create({
      ownerUserId,
      category: body.category ?? null,
      type: body.type,
      path: body.path,
      originalName: body.originalName ?? null,
      sizeBytes: body.sizeBytes ?? null,
      mimeType: body.mimeType ?? null,
      meta: body.meta ?? null,
    });
  }

  @Get()
  async list(@Request() req: any, @Query('limit') limit?: number) {
    const ownerUserId = req?.user?.sub ?? req?.user?.id;
    return this.svc.listByOwner(ownerUserId, limit ?? 100);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post(':id/meta')
  async updateMeta(@Param('id') id: string, @Body() body: { meta: Record<string, any> }) {
    return this.svc.updateMeta(id, body.meta);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.svc.delete(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        console.error('[MediaController] ファイルがアップロードされませんでした');
        throw new Error('ファイルがアップロードされませんでした');
      }

      console.log('[MediaController] ファイルアップロード開始:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        category: req.body.category,
      });

      const userId = req.user?.sub ?? req.user?.id;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // ディレクトリが存在しない場合は作成（権限777で）
      if (!fs.existsSync(uploadsDir)) {
        console.log('[MediaController] uploadsディレクトリを作成:', uploadsDir);
        fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
      } else {
        // 既存のディレクトリの権限を確認・設定
        try {
          fs.chmodSync(uploadsDir, 0o777);
        } catch (err) {
          console.warn('[MediaController] ディレクトリ権限設定に失敗（無視）:', err);
        }
      }

      // 書き込み権限の確認（ファイル書き込み前に実行）
      try {
        await fs.promises.access(uploadsDir, fs.constants.W_OK);
        console.log('[MediaController] 書き込み権限確認成功:', uploadsDir);
      } catch (accessError: any) {
        // 権限情報を詳細にログ出力
        const stats = fs.statSync(uploadsDir);
        const currentUid = process.getuid ? process.getuid() : 'N/A';
        const currentGid = process.getgid ? process.getgid() : 'N/A';
        const dirMode = (stats.mode & parseInt('777', 8)).toString(8);
        const dirOwner = stats.uid;
        const dirGroup = stats.gid;
        
        console.error('[MediaController] 書き込み権限エラー:', {
          error: accessError.message,
          errorCode: accessError.code,
          uploadsDir,
          currentUid,
          currentGid,
          dirMode: `0${dirMode}`,
          dirOwner,
          dirGroup,
          stats: {
            isDirectory: stats.isDirectory(),
            mode: stats.mode,
            uid: stats.uid,
            gid: stats.gid,
          },
        });
        
        // 権限がない場合でも続行を試みる（chmodで修正できる可能性がある）
        console.warn('[MediaController] 書き込み権限がないが、続行を試みます...');
      }

      // ファイル名をサニタイズ（危険な文字を削除）
      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${sanitizedOriginalName}`;
      const filePath = path.join(uploadsDir, fileName);
      
      console.log('[MediaController] ファイルを保存:', filePath);
      
      // ファイルを書き込み（エラー時は詳細な情報を出力）
      try {
        fs.writeFileSync(filePath, file.buffer);
      } catch (writeError: any) {
        // 書き込みエラー時の詳細情報
        const stats = fs.existsSync(uploadsDir) ? fs.statSync(uploadsDir) : null;
        const currentUid = process.getuid ? process.getuid() : 'N/A';
        const currentGid = process.getgid ? process.getgid() : 'N/A';
        
        console.error('[MediaController] ファイル書き込みエラー:', {
          error: writeError.message,
          errorCode: writeError.code,
          filePath,
          uploadsDir,
          currentUid,
          currentGid,
          dirExists: fs.existsSync(uploadsDir),
          dirStats: stats ? {
            mode: stats.mode,
            modeOctal: `0${(stats.mode & parseInt('777', 8)).toString(8)}`,
            uid: stats.uid,
            gid: stats.gid,
          } : null,
        });
        throw writeError;
      }
      
      // ファイルの権限を設定（読み書き可能）
      try {
        fs.chmodSync(filePath, 0o666);
      } catch (err) {
        console.warn('[MediaController] ファイル権限設定に失敗（無視）:', err);
      }

      console.log('[MediaController] ファイル保存成功:', filePath);

      const media = await this.svc.create({
        ownerUserId: userId,
        category: req.body.category || 'post',
        type: file.mimetype.startsWith('image/') ? 'image' : 'file',
        path: `/uploads/${fileName}`,
        originalName: file.originalname,
        sizeBytes: file.size,
        mimeType: file.mimetype,
      });

      console.log('[MediaController] メディアレコード作成成功:', (media as any).id);

      // mediaはMediaエンティティなので、idプロパティが存在する
      return {
        mediaId: (media as any).id,
        url: `/uploads/${fileName}`,
        path: `/uploads/${fileName}`,
        type: file.mimetype.startsWith('image/') ? 'image' : 'file',
      };
    } catch (error: any) {
      console.error('[MediaController] ファイルアップロードエラー:', {
        message: error.message,
        stack: error.stack,
        originalName: file?.originalname,
      });
      throw new Error(`ファイルのアップロードに失敗しました: ${error.message || '不明なエラー'}`);
    }
  }
}