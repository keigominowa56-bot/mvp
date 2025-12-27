import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliticalFundsService } from './political-funds.service';

@Controller('api/politician/funds')
export class PoliticalFundsController {
  constructor(private readonly service: PoliticalFundsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    console.log('[PoliticalFundsController] list - userId:', userId);
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.service.list(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() dto: {
    purpose: string;
    amount: number;
    date: string;
    category?: string;
    notes?: string;
  }) {
    const userId = req.user?.sub ?? req.user?.id;
    console.log('[PoliticalFundsController] create - userId:', userId);
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.service.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Request() req: any, @Body() dto: {
    purpose?: string;
    amount?: number;
    date?: string;
    category?: string;
    notes?: string;
  }) {
    const userId = req.user?.sub ?? req.user?.id;
    console.log('[PoliticalFundsController] update - userId:', userId, 'id:', id);
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.service.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    console.log('[PoliticalFundsController] delete - userId:', userId, 'id:', id);
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.service.delete(id, userId);
  }

  @Get('public/:userId')
  async getPublicFunds(@Param('userId') userId: string) {
    // 公開用エンドポイント（認証不要）
    return this.service.listPublic(userId);
  }
}

