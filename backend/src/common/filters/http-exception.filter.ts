import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp
      ? (exception as HttpException).getResponse()
      : undefined;

    // Nest の HttpException の message は string/obj の可能性がある
    const message = ((): string => {
      if (!isHttp) return 'Internal server error';
      if (typeof responseBody === 'string') return responseBody;
      if (responseBody && typeof responseBody === 'object') {
        // class-validator のメッセージ配列などに対応
        if (Array.isArray((responseBody as any).message)) {
          return (responseBody as any).message.join('; ');
        }
        return (responseBody as any).message || (responseBody as any).error || 'Error';
      }
      return 'Error';
    })();

    // 共通エラーフォーマット
    const payload = {
      success: false,
      error: {
        statusCode: status,
        message,
        path: req.originalUrl || req.url,
        timestamp: new Date().toISOString(),
        // 必要に応じてアプリ固有のエラーコードを付与可能
        // code: (responseBody as any)?.code,
        // details: (responseBody as any)?.details,
      },
    };

    res.status(status).json(payload);
  }
}