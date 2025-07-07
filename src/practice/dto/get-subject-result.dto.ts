import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
} from 'class-validator';

export class GetSubjectResultDto {
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
}
