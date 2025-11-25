import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { PledgesService } from './pledges.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';

@Controller('pledges')
export class PledgesController {
  constructor(private readonly service: PledgesService) {}

  @Get()
  async list(@Query('memberId') memberId?: string) {
    if (memberId) return this.service.findByMember(memberId);
    return this.service.findAll();
  }

  @Get('stats')
  async stats() {
    return this.service.getStats();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreatePledgeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePledgeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: true; id: string }> {
    return this.service.remove(id);
  }
}