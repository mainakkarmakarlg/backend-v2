import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QuizToPlatformNdCourseDto {
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
