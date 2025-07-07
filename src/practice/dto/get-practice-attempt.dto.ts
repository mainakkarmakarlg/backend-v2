import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';

export class GetPracticeAttemptDto {
  // @ApiProperty()
  // @Transform(({ value }) => parseInt(value))
  // @IsNumber()
  // courseId: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  hasSubmitted: boolean;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  isOldFirst: boolean;
}
