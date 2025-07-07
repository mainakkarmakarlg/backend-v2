import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, isString, IsString } from 'class-validator';

export class QuizGetDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  searchString: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  quizId: number;
}
