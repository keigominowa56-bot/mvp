import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';
import { MediaCategory } from '../../enums/media-category.enum';

@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(private readonly media: MediaService) {}

  /**
   * POST /media/upload
   * フォームフィールド:
   * - file: 単一ファイル（image/video/document）
   * - category: 'post' | 'comment' | 'kyc'
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('category') category?: MediaCategory,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) throw new UnauthorizedException();
    if (!file) throw new BadRequestException('File is required');
    const cat = category || MediaCategory.POST;
    return this.media.uploadFile(file, userId, cat);
  }
}