import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';


class QuizToPlatformNdCourseDto {
  @ApiProperty()
  @IsNumber()
  quizId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  courseId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  platformId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  interface: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  slug: string;
}

export class CreateQuizDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  resultType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  accessType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  timeType: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  duration: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  attemptType: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  quizId: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startTime: Date;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endTime: Date;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  notified: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @IsOptional()
  courseNdPlatform : QuizToPlatformNdCourseDto
}
