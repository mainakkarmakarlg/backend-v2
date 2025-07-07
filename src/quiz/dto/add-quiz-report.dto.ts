import { ApiProperty } from '@nestjs/swagger';
import {
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class AddQuizReportDto {
  @ApiProperty()
  @ValidateIf((o) => o.report === undefined)
  @IsJSON()
  reportTag: JSON;

  @ApiProperty()
  @ValidateIf((o) => o.reportTag === undefined)
  @IsString()
  report: string;

  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  courseId: number;
}
