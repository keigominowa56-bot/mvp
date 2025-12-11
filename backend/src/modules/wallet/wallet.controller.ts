import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('transactions')
  async transactions(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.wallet.list(userId);
  }
}