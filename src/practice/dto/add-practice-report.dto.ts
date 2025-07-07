import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumber, IsString, ValidateIf } from 'class-validator';

export class AddPracticeReportDto {
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

  // @ApiProperty()
  // @IsNumber()
  // courseId: number;
}
