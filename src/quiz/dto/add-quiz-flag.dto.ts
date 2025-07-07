import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddQuizFlagDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  flagText: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  remove: boolean;
}
