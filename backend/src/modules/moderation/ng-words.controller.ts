import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { NgWordsService } from './ng-words.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('moderation/ng-words')
export class NgWordsController {
  constructor(private readonly svc: NgWordsService) {}

  @Get()
  async list() {
    return this.svc.list();
  }

  // 管理者のみ追加できるようにする（必要に応じて）
  @Roles('admin')
  @Post()
  async add(@Body() body: { word: string }) {
    const { word } = body;
    return this.svc.add(word);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}