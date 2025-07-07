import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class GetPracticeStatDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // @IsNumber()
  // courseId: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @ApiProperty()
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsString()
  @IsNotEmpty()
  parameter: string;
}
