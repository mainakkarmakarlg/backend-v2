import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class NoticeBoardQueryDto {
  @ApiProperty({
    description: 'Noticeboard Events Start Date',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Noticeboard Events End Date', required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate({})
  endDate: Date;

  @ApiProperty({ description: 'Course ID', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'Does Event require register', required: false })
  @IsOptional()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Meta Key', required: false })
  @IsOptional()
  @IsString()
  key: string;

  @ApiProperty({ description: 'Gallery Key', required: false })
  @IsOptional()
  @IsEnum(['all', 'featured'])
  galleryKey: string;

  @ApiProperty({ description: 'Noticeboard Events Key', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  eventId: number;

  @ApiProperty({ description: 'Noticeboard Events Key', required: false })
  @IsOptional()
  @IsString()
  eventName: string;
}
