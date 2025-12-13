import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { Survey } from '../../entities/survey.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey) private readonly surveys: Repository<Survey>,
    @InjectRepository(SurveyResponse) private readonly responses: Repository<SurveyResponse>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async availableForUser(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const all = await this.surveys.find({
      where: [
        { startAt: IsNull(), endAt: IsNull() },
        { startAt: Between(new Date(0), now), endAt: IsNull() },
        { startAt: Between(new Date(0), now), endAt: Between(now, new Date('9999-12-31')) },
      ],
    });

    return all.filter((s) => {
      const t = s.targetCriteria || {};
      const ageOk = !t.ageGroups || t.ageGroups.includes(String(user.ageGroup));
      return ageOk;
    });
  }

  async submitResponse(surveyId: string, respondentUserId: string, dto: { answers: Record<string, any> }) {
    const survey = await this.surveys.findOne({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Survey not found');

    const existing = await this.responses.findOne({ where: { surveyId, respondentUserId } });
    if (existing) throw new BadRequestException('Already responded');

    const response = this.responses.create({ surveyId, respondentUserId, answers: dto.answers });
    await this.responses.save(response);

    return { response };
  }
}