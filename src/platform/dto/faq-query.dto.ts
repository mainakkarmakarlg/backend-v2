import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FaqQueryDto {
  @ApiProperty({
    description: 'FAQ mode',
    required: false,
    enum: ['Changes', 'Syllabus', 'Platform', 'Class', 'formulas'],
  })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({ description: 'Course ID', required: false })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'FAQ search string', required: false })
  @IsString()
  @IsOptional()
  url: string;
}
