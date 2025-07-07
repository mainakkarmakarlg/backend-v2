import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetSubjectDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  subjectId: number;
  // @ApiProperty()
  // @Transform(({ value }) => parseInt(value))
  // @IsNumber()
  // courseId: number;
  @ApiProperty()
  @IsOptional()
  searchString: string;
}
