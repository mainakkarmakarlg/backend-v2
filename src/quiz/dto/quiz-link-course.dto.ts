import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class QuizLinkCourseDto {
  @ApiProperty()
  @IsInt()
  quizId: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  courseId: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  platformId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  interface: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  slug: string;
}
