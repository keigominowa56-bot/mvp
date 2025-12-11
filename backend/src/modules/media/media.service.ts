import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { Media } from '../../entities/media.entity';
import { MediaType } from '../../enums/media-type.enum';
import { MediaCategory } from '../../enums/media-category.enum';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private readonly repo: Repository<Media>) {}

  private detectType(mime: string): MediaType {
    if (!mime) return MediaType.DOCUMENT;
    if (mime.startsWith('image/')) return MediaType.IMAGE;
    if (mime.startsWith('video/')) return MediaType.VIDEO;
    return MediaType.DOCUMENT;
  }

  /**
   * S3などにアップロードする箇所のダミー実装。
   * ここでは /uploads/{uuid}.{ext} のURLを返します。
   */
  async uploadFile(
    file: Express.Multer.File,
    ownerUserId: string,
    category: MediaCategory,
  ): Promise<{ mediaId: string; url: string; type: MediaType }> {
    if (!file) throw new BadRequestException('file is required');

    const id = uuidv4();
    const ext = (file.originalname.split('.').pop() || '').toLowerCase();
    const url = `/uploads/${id}${ext ? `.${ext}` : ''}`;
    const type = this.detectType(file.mimetype);

    // MIME/サイズの簡易チェック（必要に応じて厳格化）
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) throw new BadRequestException('File too large');

    // 拡張: カテゴリ別の許容タイプ（例: KYCはdocument/imageのみ等）
    if (category === MediaCategory.KYC && type === MediaType.VIDEO) {
      throw new BadRequestException('Video is not allowed for KYC');
    }

    const record = this.repo.create({
      id,
      ownerUserId,
      type,
      category,
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    await this.repo.save(record);

    return { mediaId: id, url, type };
  }
}