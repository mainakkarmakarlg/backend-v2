import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class SubjectMark {
  @ApiProperty({ description: 'Name of the subject' })
  subject: string;

  @ApiProperty({ description: 'Marks obtained in the subject' })
  marks: number;
}

export class ResultAnalysisDto {
  @ApiProperty({ description: 'courseId of session', required: true })
  @Transform(({ value }) => {
    return Number(value);
  })
  // @IsNumber()
  courseId: number;

  @ApiProperty({
    description: 'Array of object ({subject, marks})',
    type: [SubjectMark],
    required: true,
  })
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  // @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectMark)
  marks: SubjectMark[];

  @Transform(({ value }) => {
    return value === 'true' ? true : false;
  })
  // @IsBoolean()
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPass: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  enrollmentId: string;
}

export class ResultAnalysisSeedDto {
  @ApiProperty({ description: 'courseId of session', required: true })
  @Transform(({ value }) => {
    return Number(value);
  })
  // @IsNumber()
  courseId: number;

  userId: number;

  @ApiProperty({
    description: 'Array of object ({subject, marks})',
    type: [SubjectMark],
    required: true,
  })
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  // @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectMark)
  marks: SubjectMark[];

  @Transform(({ value }) => {
    return value === 'true' ? true : false;
  })
  // @IsBoolean()
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPass: boolean;

  @IsString()
  attachment: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  enrollmentId: string;
}
