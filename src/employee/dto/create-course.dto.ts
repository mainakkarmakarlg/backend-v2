import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  abbr: string;

  @IsOptional()
  @IsString()
  courseId: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry: Date;
}
