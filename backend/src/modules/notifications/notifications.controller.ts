import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly svc: NotificationsService,
    private readonly mail: MailService,
  ) {}

  // 認証必須
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.svc.listForUser(userId);
  }

  // 認証必須
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async read(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.svc.markRead(id, userId);
  }

  // 管理者限定
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('send')
  async send(
    @Body()
    body: {
      userId: string;
      type: string;
      title: string;
      linkUrl?: string;
      text?: string;
      email?: string;
    },
  ) {
    const res = await this.svc.sendToUser(body.userId, {
      type: body.type,
      title: body.title,
      body: body.text,
      linkUrl: body.linkUrl,
    });
    if (body.email) {
      await this.mail.send({
        to: body.email,
        subject: body.title,
        text: body.text,
        html: body.linkUrl ? `<a href="${body.linkUrl}">${body.linkUrl}</a>` : undefined,
      });
    }
    return res;
  }

  // 管理者限定
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('bulk')
  async bulk(
    @Body()
    body: { userIds: string[]; type: string; title: string; linkUrl?: string; text?: string },
  ) {
    return this.svc.bulkSend(body.userIds, {
      type: body.type,
      title: body.title,
      body: body.text,
      linkUrl: body.linkUrl,
    });
  }
}