import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PledgesService } from './pledges.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Pledges')
@Controller('pledges')
export class PledgesController {
  constructor(private readonly pledgesService: PledgesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pledge (Admin only)' })
  @ApiResponse({ status: 201, description: 'Pledge created successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  create(@Body() createPledgeDto: CreatePledgeDto) {
    return this.pledgesService.create(createPledgeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pledges' })
  @ApiResponse({ status: 200, description: 'Pledges retrieved successfully' })
  findAll() {
    return this.pledgesService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pledge statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pledge statistics retrieved successfully' })
  getStats() {
    return this.pledgesService.getStats();
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get pledges by member ID' })
  @ApiResponse({ status: 200, description: 'Pledges retrieved successfully' })
  findByMember(@Param('memberId') memberId: string) {
    return this.pledgesService.findByMember(memberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pledge by ID' })
  @ApiResponse({ status: 200, description: 'Pledge retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pledge not found' })
  findOne(@Param('id') id: string) {
    return this.pledgesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pledge by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pledge updated successfully' })
  @ApiResponse({ status: 404, description: 'Pledge not found' })
  update(@Param('id') id: string, @Body() updatePledgeDto: UpdatePledgeDto) {
    return this.pledgesService.update(id, updatePledgeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pledge by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pledge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pledge not found' })
  remove(@Param('id') id: string) {
    return this.pledgesService.remove(id);
  }
}
