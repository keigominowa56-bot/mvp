import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    // 開発用: SMTPが無くても送信内容を確認できるJSONトランスポート
    jsonTransport: true,
  });

  async send(opts: { to: string; subject: string; text?: string; html?: string }) {
    const info = await this.transporter.sendMail({
      from: 'no-reply@example.com',
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return {
      messageId: (info as any).messageId ?? 'dev',
      envelope: (info as any).envelope,
      accepted: (info as any).accepted,
      rejected: (info as any).rejected,
    };
  }
}