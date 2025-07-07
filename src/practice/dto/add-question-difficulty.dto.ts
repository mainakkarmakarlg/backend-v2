import { IsEnum, IsNotEmpty } from 'class-validator';

export class AddQuestionDifficultyDto {
  @IsNotEmpty()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;
}
