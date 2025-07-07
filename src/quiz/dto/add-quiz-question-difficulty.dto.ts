import { IsEnum, IsNotEmpty } from 'class-validator';

export class AddQuizQuestionDifficultyDto {
  @IsNotEmpty()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;
}
