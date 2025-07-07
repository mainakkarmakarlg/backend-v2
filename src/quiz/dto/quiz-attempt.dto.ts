import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QuizAttemptStartDto {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  quizId: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  attemptId: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => String(value))
  @IsString()
  slug: string;
}
