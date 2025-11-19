// backend/src/modules/activity-logs/activity-logs.controller.ts

import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto'; // 追加: DTOが存在すると仮定
import { ActivityLog } from '../../entities/activity-log.entity.js';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('activity-logs')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @ApiOperation({ summary: '新しい活動ログを作成する' })
  async create(@Body() createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    return this.activityLogsService.create(createActivityLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'すべての活動ログを取得する' })
  async findAll(): Promise<ActivityLog[]> {
    return this.activityLogsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '特定の活動ログを取得する' })
  async findOne(@Param('id') id: string): Promise<ActivityLog> {
    return this.activityLogsService.findOne(id);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '特定のメンバーの活動ログを全て取得する' })
  async findByMember(@Param('memberId') memberId: string): Promise<ActivityLog[]> {
    // エラーTS2551修正: findByMemberをfindByMemberIdに変更
    return this.activityLogsService.findByMemberId(memberId);
  }

  @Put(':id')
  @ApiOperation({ summary: '特定の活動ログを更新する' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityLogDto: UpdateActivityLogDto,
  ): Promise<ActivityLog> {
    // エラーTS2339修正: updateメソッドを呼び出す (サービス側で実装済み)
    return this.activityLogsService.update(id, updateActivityLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '特定の活動ログを削除する' })
  async remove(@Param('id') id: string): Promise<{ deleted: true; id: string }> {
    // エラーTS2339修正: removeメソッドを呼び出す (サービス側で実装済み)
    return this.activityLogsService.remove(id);
  }
}