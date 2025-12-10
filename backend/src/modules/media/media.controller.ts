import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * メディアアップロードの API。
 * - 認証必須（JWT）
 * - FileInterceptor('file') で単一ファイルを受け付ける
 */
@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /media/upload
   * フォームフィールド名: "file"
   * 例: curl -F "file=@/path/to/image.jpg" http://localhost:3001/media/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadSingleFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.mediaService.uploadFile(file, userId);
  }
}