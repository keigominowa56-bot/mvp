import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(@InjectRepository(WalletTransaction) private readonly wallet: Repository<WalletTransaction>) {}

  async list(userId: string) {
    return this.wallet.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}