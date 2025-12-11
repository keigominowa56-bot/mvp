import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Survey } from './survey.entity';
import { User } from './user.entity';

@Entity('survey_responses')
@Unique('UQ_survey_respondent', ['surveyId', 'respondentUserId'])
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  surveyId: string;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  survey: Survey;

  @Index()
  @Column()
  respondentUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  respondent: User;

  @Column({ type: 'json' })
  answers: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}