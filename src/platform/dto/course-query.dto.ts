import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CourseQueryDto {
  @ApiProperty({ description: 'Course ID', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'Course search string', required: false })
  @IsOptional()
  @IsString()
  courseSearchString: string;

  @ApiProperty({ description: 'Course Option key', required: false })
  @IsOptional()
  @IsString()
  key: string;
}
