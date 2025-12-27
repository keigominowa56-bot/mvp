import { Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async listAll(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    // 全ての通知を取得（既読/未読に関わらず）
    return this.notifications.listAll(userId);
  }

  @Get('count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    const count = await this.notifications.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.notifications.markRead(id, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.notifications.delete(id, userId);
  }
}