import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumber } from 'class-validator';

export class ResultSavePostDto {
  @ApiProperty()
  @IsNumber()
  courseId: string;

  @ApiProperty()
  @IsJSON()
  result: JSON;
}
