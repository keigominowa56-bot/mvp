// backend/src/modules/members/members.controller.ts (完全なコード)

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Member } from '../../entities/member.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'メンバーを作成' })
  @ApiResponse({ status: 201, type: Member })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'メンバー一覧を取得' })
  @ApiResponse({ status: 200, type: [Member] })
  findAll() {
    return this.membersService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'メンバーの統計情報を取得' })
  getStats() {
    return this.membersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'IDでメンバーを取得' })
  @ApiResponse({ status: 200, type: Member })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'メンバーを更新' })
  @ApiResponse({ status: 200, type: Member })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'メンバーを削除' })
  @ApiResponse({ status: 204, description: '削除成功' })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
  
  @Get(':id/fund-summary')
  @ApiOperation({ summary: 'メンバーの活動資金サマリーを取得' })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number })
  getActivityFundSummary(
    @Param('id') id: string,
    @Query('fiscalYear', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) fiscalYear: number, // 修正: デフォルト値とPipeを追加
  ) {
    return this.membersService.getActivityFundSummary(id, fiscalYear);
  }
}