import { IsObject } from 'class-validator';

export class CreateSurveyResponseDto {
  @IsObject()
  answers: Record<string, any>;
}