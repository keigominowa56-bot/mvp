import { Controller, Get, Post, UseGuards, UploadedFile, UseInterceptors, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
// @UseGuards(JwtAuthGuard, AdminGuard) // デモ用に一時的に無効化
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Post('import/activity-funds/:memberId')
  @UseInterceptors(FileInterceptor('file'))
  async importActivityFunds(
    @Param('memberId') memberId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminService.importActivityFunds(memberId, file);
  }

  @Post('collect-data')
  async collectExternalData() {
    return this.adminService.collectExternalData();
  }
}