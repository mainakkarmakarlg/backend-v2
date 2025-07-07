import { IsJSON, IsNumber } from 'class-validator';

export class AddQuizFeedbackDto {
  @IsNumber()
  quizId: number;

  @IsJSON()
  feedback: JSON;
}
