import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class GetPracticeDto {
  // @ApiProperty()
  // @Transform(({ value }) => parseInt(value))
  // @IsNumber()
  // @IsNotEmpty()
  // courseId: number;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  attemptId: number;
}
