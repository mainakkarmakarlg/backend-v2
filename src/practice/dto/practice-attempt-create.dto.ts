import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class PracticeAttemptCreateDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  questionCount: number;

  @ApiProperty()
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  includeEasy: boolean;

  @ApiProperty()
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  includeMedium: boolean;

  @ApiProperty()
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  includeHard: boolean;

  @ApiProperty()
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  isFlagged: boolean;

  @ApiProperty()
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  isIncorrect: boolean;

  @ApiProperty()
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  isUnattempted: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  subjectIds: number[];

  // @ApiProperty()
  // @IsOptional()
  // @IsNumber()
  // courseId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  attemptId: number;

  @ApiProperty()
  @IsBoolean()
  otherSubject: boolean;
}
