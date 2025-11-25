import { Controller, Post, Body } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Post('upload')
  upload(@Body('type') type: string) {
    return this.svc.fakeUpload(type === 'video' ? 'video' : 'image');
  }
}
