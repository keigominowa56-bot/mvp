import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Survey } from '../../entities/survey.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { WalletTransactionType } from '../../enums/wallet-transaction-type.enum';
import { Currency } from '../../enums/currency.enum';
import { CreateSurveyResponseDto } from './dto/create-response.dto';
import { KycStatus } from '../../enums/kyc-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../enums/notification-type.enum';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey) private readonly surveys: Repository<Survey>,
    @InjectRepository(SurveyResponse) private readonly responses: Repository<SurveyResponse>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(WalletTransaction) private readonly wallet: Repository<WalletTransaction>,
    private readonly notifications: NotificationsService,
  ) {}

  async availableForUser(userId: string) {
    const user = await this.users.findOne({ where: { id: userId }, relations: ['region', 'supportedParty'] });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const all = await this.surveys.find({
      where: [
        { startAt: null, endAt: null },
        { startAt: Between(new Date(0), now), endAt: null },
        { startAt: Between(new Date(0), now), endAt: Between(now, new Date('9999-12-31')) },
      ],
    });

    // 簡易フィルタ：targetCriteria に一致するもののみ
    return all.filter((s) => {
      const t = s.targetCriteria || {};
      const regionOk = !t.regionIds || (user.region && t.regionIds.includes(user.region.id));
      const partyOk = !t.partyIds || (user.supportedParty && t.partyIds.includes(user.supportedParty.id));
      const ageOk = !t.ageGroups || t.ageGroups.includes(String(user.ageGroup));
      return regionOk && partyOk && ageOk;
    });
  }

  async submitResponse(surveyId: string, respondentUserId: string, dto: CreateSurveyResponseDto) {
    const survey = await this.surveys.findOne({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Survey not found');

    const user = await this.users.findOne({ where: { id: respondentUserId } });
    if (!user) throw new NotFoundException('User not found');

    // 重複回答禁止
    const existing = await this.responses.findOne({ where: { surveyId, respondentUserId } });
    if (existing) throw new BadRequestException('Already responded');

    const response = this.responses.create({ surveyId, respondentUserId, answers: dto.answers });
    await this.responses.save(response);

    // KYC チェック（報酬付与は verified のみ）
    if (user.kycStatus !== KycStatus.VERIFIED) {
      // 通知のみ（保留）
      await this.notifications.notify(user.id, {
        type: NotificationType.SURVEY,
        title: 'アンケート回答を受け付けました',
        body: '現在、KYC未検証のため報酬は保留中です。KYCページから検証を進めてください。',
      });
      return { response, reward: 'pending' };
    }

    // 報酬付与（固定額の例: 100円）
    const tx = this.wallet.create({
      userId: user.id,
      type: WalletTransactionType.REWARD,
      amount: 100,
      currency: Currency.JPY,
      memo: `Survey reward: ${survey.title}`,
    });
    await this.wallet.save(tx);

    // 通知
    await this.notifications.notify(user.id, {
      type: NotificationType.SURVEY,
      title: 'アンケート報酬を付与しました',
      body: `「${survey.title}」の回答に対する報酬 100円 を付与しました。`,
    });

    return { response, reward: 'granted', transaction: tx };
  }
}