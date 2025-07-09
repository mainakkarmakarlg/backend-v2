import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
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
  @IsString()
  longDescription: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shortDescription: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  regStartTime: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  regEndTime: string;
}
