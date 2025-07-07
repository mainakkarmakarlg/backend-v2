import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostQuestionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  fallNumId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  sourceId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  requestedQuestion: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  practiceId: number;
}
