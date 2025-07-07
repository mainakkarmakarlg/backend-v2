import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class FixQuestionDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  questionId: number;
  question: string;
}
