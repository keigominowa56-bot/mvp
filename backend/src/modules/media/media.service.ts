import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { Media } from '../../entities/media.entity';

/**
 * 本サービスは、アップロードされたファイルを受け取って Media レコードを作成し、
 * メディアID（UUID）と参照URLを返します。
 * 実運用では S3 などのクラウドストレージへのアップロード処理に置き換えてください。
 */
@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly repo: Repository<Media>,
  ) {}

  /**
   * 単一ファイルのアップロード処理（ダミー実装）
   * - mediaId を新規発行
   * - ダミーURL（/uploads/{mediaId}.{ext}）を生成
   * - DB（Media）にレコードを保存
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ mediaId: string; url: string }> {
    const mediaId = uuidv4();
    const fileExtension = (file.originalname.split('.').pop() || '').toLowerCase();
    const url = `/uploads/${mediaId}${fileExtension ? `.${fileExtension}` : ''}`;

    const media = this.repo.create({
      id: mediaId,
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      // 必要に応じて type や metadata を保存
      // type: file.mimetype.startsWith('image') ? 'image' : 'video',
    });

    await this.repo.save(media);

    return { mediaId, url };
  }
}