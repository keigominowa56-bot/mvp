import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('activity-funds')
export class ActivityFundsController {
  @Get()
  list() {
    const dummyData: any[] = [];
    return { ok: true, data: dummyData };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() _file: Express.Multer.File) {
    return { ok: true };
  }
}