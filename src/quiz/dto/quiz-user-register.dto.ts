import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsJSON, IsNumber } from 'class-validator';

export class QuizUserRegisterDto {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  quizId: number;

  @ApiProperty()
  @IsJSON()
  fields: string;
}
