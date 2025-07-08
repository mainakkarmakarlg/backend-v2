import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsInt()
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
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
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
}
