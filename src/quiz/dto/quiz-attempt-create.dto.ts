import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class QuizAttemptCreateDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  quizId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  attemptId: number;
}
