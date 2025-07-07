import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetQuizAnswersDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  attemptId: number;
}
