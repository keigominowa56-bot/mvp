import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaAsset } from './media-asset.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(MediaAsset) private repo: Repository<MediaAsset>) {}

  async fakeUpload(type: string) {
    const asset = this.repo.create({
      url: `https://example.com/fake/${Date.now()}.${type === 'video' ? 'mp4' : 'png'}`,
      type
    });
    return this.repo.save(asset);
  }
}
